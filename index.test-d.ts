import {expectType} from 'tsd';
import tippy, {Instance} from '.';

expectType<Instance | Instance[]>(tippy('button'));
expectType<Instance | Instance[]>(
  tippy('button', {
    content: 'hello',
  }),
);
