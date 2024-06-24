import { CaretRightIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, Flex, Spinner, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { KeyboardEventHandler, useCallback, useRef } from 'react';
import { Link } from '../../../../components/Link';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { Sort } from './Sort';

interface SearchBarProps {
  topResult?: TankDefinition;
}

export function SearchBar({ topResult }: SearchBarProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const searching = useTankopediaFilters((state) => state.searching);
  const search = useCallback(
    debounce(() => {
      useTankopediaFilters.setState({ searching: false });

      if (!input.current) return;

      const sanitized = input.current.value.trim();

      useTankopediaFilters.setState({
        search: sanitized.length === 0 ? undefined : sanitized,
      });
    }, 500),
    [],
  );
  const handleChange = useCallback(() => {
    useTankopediaFilters.setState({ searching: true });
    search();
  }, []);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== 'Enter' || !topResult || searching) return;

      event.preventDefault();
      router.push(`/tools/tankopedia/${topResult.id}`);
    },
    [topResult],
  );

  return (
    <Flex justify="center">
      <Flex gap="2" flexGrow="1">
        <TextField.Root
          style={{ flex: 1 }}
          ref={input}
          placeholder="Search tanks..."
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        >
          <TextField.Slot>
            {searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>

          {topResult && !searching && (
            <TextField.Slot>
              <Link href={`/tools/tankopedia/${topResult.id}`}>
                <Button variant="ghost">
                  {topResult.name} <CaretRightIcon />
                </Button>
              </Link>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Sort />
      </Flex>
    </Flex>
  );
}