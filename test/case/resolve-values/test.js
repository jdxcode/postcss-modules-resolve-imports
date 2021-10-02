import {ResolveImports} from '../../../src/index';
import setup from '../../setup';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('resolve-readme-example', () => {
  const {resulting, exports: tokens} = setup(
    'values',
    'extract-imports',
    ResolveImports({icssExports: true})
  )(__dirname);

  expect(resulting).toMatchSnapshot();
  expect(tokens).toMatchSnapshot();
});
