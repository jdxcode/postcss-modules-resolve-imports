import {resolve} from 'path';
import {ResolveImports} from '../../../src/index';
import setup from '../../setup';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('opts-modules', () => {
  const {resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    ResolveImports({
      resolve: {
        modules: [resolve(__dirname, 'lib')],
      },
    })
  )(__dirname);

  expect(resulting).toMatchSnapshot();
  expect(tokens).toMatchSnapshot();
});
