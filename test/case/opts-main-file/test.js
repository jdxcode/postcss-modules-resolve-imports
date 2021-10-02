import {ResolveImports} from '../../../src/index';
import setup from '../../setup';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('opts-main-file', () => {
  const {resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    ResolveImports({
      resolve: {
        mainFile: 'a.css',
      },
    })
  )(__dirname);

  expect(resulting).toMatchSnapshot();
  expect(tokens).toMatchSnapshot();
});
