import { writeUser, readUser } from 'rc9';

const main = async () => {
  writeUser({ token: 123 }, '.zoorc'); // Will be saved in {home}/.zoorc

  const conf = readUser('.zoorc'); // { token: 123 }
  console.log(conf.token); // 123
};

main();
