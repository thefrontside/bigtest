import yargs from 'yargs';

yargs({})
  .command('server', 'start a bigtest server', () => {
    console.log('[BIGTEST SERVER CODE RUNS HERE]')
  })
  .parse();
