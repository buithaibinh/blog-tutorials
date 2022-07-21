import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import dedent from 'dedent';
import https from 'https';
import xml2js from 'xml2js';
import moment from 'moment';

moment.locale('en-US');

const __dirname = path.resolve();

const genFrontMatter = async (answers) => {
  let d = new Date();
  const date = [
    d.getFullYear(),
    ('0' + (d.getMonth() + 1)).slice(-2),
    ('0' + d.getDate()).slice(-2),
  ].join('-');

  let frontMatter =
    '# CodeWithYou.com - Everything about Web Development and Cloud Computing.';
  frontMatter = frontMatter + '\n';

  // last updated
  frontMatter = frontMatter + `## Last Updated: ${date}\n\n`;

  frontMatter = dedent`${frontMatter}
  Title | Published
  --- | ---\n`;

  // read all data from https://www.codewithyou.com/feed.xml and generate a markdown file
  const parser = new xml2js.Parser();
  let xml = '';
  return new Promise((resolve, reject) => {
    https.get('https://www.codewithyou.com/feed.xml', function (res) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        res.on('data', function (data_) {
          xml += data_.toString();
        });
        res.on('end', function () {
          parser.parseString(xml, function (err, result) {
            const posts = result.rss.channel[0].item
              .map((post) => {
                return dedent`[**${post.title}**](${post.link})| ${moment(
                  post.pubDate[0]
                ).format('YYYY-MM-DD')}`;
              })
              .join('\n');
            frontMatter = frontMatter + posts;
            resolve(frontMatter);
          });
        });
      }
    });
  });
};

inquirer
  .prompt([])
  .then(async (answers) => {
    const frontMatter = await genFrontMatter(answers);
    const filePath = `${path.resolve(__dirname, '../README.md')}`;
    fs.writeFile(filePath, frontMatter, { flag: 'w' }, (err) => {
      if (err) {
        throw err;
      } else {
        console.log(`README.md generated successfully at ${filePath}`);
      }
    });
  })
  .catch((error) => {
    console.log(error);
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      console.log('Something went wrong, sorry!');
    }
  });
