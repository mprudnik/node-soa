import crypto from 'node:crypto';

const SALT_LENGTH = 15;
const KEY_LENGTH = 64;

const hash = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err !== null) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });

const compare = (password, hash) =>
  new Promise((resolve, reject) => {
    const [salt, hashedPassword] = hash.split(':');
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err !== null) reject(err);
      resolve(derivedKey.toString('hex') === hashedPassword);
    });
  });

const random = (length = 36) => crypto.randomBytes(length).toString('base64');

export default () => ({ hash, compare, random });
