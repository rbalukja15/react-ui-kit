// Type tests. Never run: `npm run typecheck` compiles this file, so a line
// that stops compiling, or an @ts-expect-error line that starts compiling,
// fails the check.
import * as React from 'react';
import { expectTypeOf } from 'vitest';
import { useForm } from 'react-hook-form';
import { IdAutocomplete, type IdOption } from './IdAutocomplete';
import { RhfIdAutocomplete } from './IdAutocomplete.rhf';
import { withPinnedOption } from './createOption';

/** A record declared as an interface, the way API response types usually are. */
interface Person {
  id: number;
  label: string;
  email: string;
}

declare const people: Person[];

/** Interface-typed options work everywhere, and keep their own type. */
export function InterfaceOptions() {
  const [ownerId, setOwnerId] = React.useState<number | null>(null);
  const { control } = useForm<{ ownerId: number | null }>();
  const options = withPinnedOption(people, people[0]);
  expectTypeOf(options).toEqualTypeOf<readonly Person[]>();
  return (
    <>
      <IdAutocomplete
        label="Owner"
        options={people}
        value={ownerId}
        onChange={setOwnerId}
        onChangeOption={(person) => expectTypeOf(person).toEqualTypeOf<Person | null>()}
      />
      <RhfIdAutocomplete
        name="ownerId"
        control={control}
        label="Owner"
        options={options}
        onChangeOption={(person) => expectTypeOf(person).toEqualTypeOf<Person | null>()}
      />
    </>
  );
}

/** An option literal is checked like any other object, so a misspelt field is caught. */
export const misspelt: IdOption = {
  id: 1,
  label: 'Ada Lovelace',
  // @ts-expect-error `sublable` is not a field of IdOption.
  sublable: 'ada@example.com',
};
