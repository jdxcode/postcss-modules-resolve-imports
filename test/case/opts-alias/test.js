import {resolve} from 'path';
import {ResolveImports} from '../../../src/index';
import setup from '../../setup';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('opts-alias', () => {
  const {resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    ResolveImports({
      resolve: {
        alias: {
          button: resolve(__dirname, 'lib/button/button.css'),
        },
      },
    })
  )(__dirname);

  expect(resulting).toMatchSnapshot();
  expect(tokens).toMatchSnapshot();
});
