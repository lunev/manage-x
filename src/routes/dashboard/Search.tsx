import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';

const Search: React.FC<{ onSearch: (query: string) => void }> = ({
  onSearch,
}) => {
  const [inputValue, setInputValue] = useState('');
  const { search } = useAppSelector((state) => state.preferences);

  const handleInputChange = (query: string) => {
    setInputValue(query);
    onSearch(query);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <>
      {search.visible && (
        <div className="mb-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute translate-x-2 translate-y-3 opacity-50" />
            <Input
              className={`w-full mb-2 px-7 text-sm`}
              placeholder="Search"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <Cross2Icon
              className={`absolute top-3 right-3 cursor-pointer transition-all duration-300 ${
                inputValue ? 'opacity-50' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => handleClear()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Search;
