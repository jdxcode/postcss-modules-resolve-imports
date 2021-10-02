import setup from '../../setup.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('identity', () => {
  const {resulting} = setup()(__dirname);

  expect(resulting).toMatchSnapshot();
});
