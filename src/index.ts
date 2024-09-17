import * as cron from "node-cron";
import { exec } from "child_process";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

dotenv.config();

/* MySQL credentials */
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

/* Remote machine for SCP */
const LOCAL_USER = process.env.LOCAL_USER;
const LOCAL_HOST = process.env.LOCAL_HOST;
const LOCAL_DIR = process.env.LOCAL_DIR;
const SCP_PASS = process.env.SCP_PASS;

/* Validate required environment variables */
if (
  !DB_HOST ||
  !DB_USER ||
  !DB_PASS ||
  !DB_NAME ||
  !LOCAL_USER ||
  !LOCAL_HOST ||
  !LOCAL_DIR ||
  !SCP_PASS
) {
  console.error(
    "Missing one or more environment variables. Please check your .env file.",
  );
  process.exit(1);
}

const BACKUP_DIR = path.join(os.homedir(), "db_backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = `${BACKUP_DIR}/${DB_NAME}-${timestamp}.sql`;

  const dumpCommand = `mysqldump --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASS} ${DB_NAME} > ${backupFile}`;
  const scpCommand = `sshpass -p ${SCP_PASS} scp ${backupFile} ${LOCAL_USER}@${LOCAL_HOST}:${LOCAL_DIR}`;

  exec(dumpCommand, (error, _stdout, stderr) => {
    if (error) {
      console.error(`Backup failed: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Dump error output: ${stderr}`);
      return;
    }

    console.log(`Database backup for ${DB_NAME} saved to: ${backupFile}`);

    exec(scpCommand, (error, _stdout, stderr) => {
      if (error) {
        console.error(`SCP failed: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`SCP error output: ${stderr}`);
        return;
      }

      console.log(
        `Database backup for ${DB_NAME} transferred successfully to ${LOCAL_HOST}:${LOCAL_DIR}`,
      );
    });
  });
};

/* Schedule daily backup at midnight (00:00) */
cron.schedule("0 0 * * *", () => {
  console.log(`Running daily database backup for: ${DB_NAME}`);
  backupDatabase();
});

console.log(`Scheduled daily database backup for: ${DB_NAME}`);
