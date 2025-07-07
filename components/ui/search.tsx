'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface SearchProps {
  placeholder: string;
  handleSearch: (term: string) => void;  // Accept the handleSearch function as a prop
}

export default function Search({ placeholder, handleSearch }: SearchProps) {
  const searchParams:any = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Buscar Nesecidad...
      </label>
      <input
        className="peer block w-full py-[9px] pl-10 text-sm placeholder:text-black bg-white border rounded-lg"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
