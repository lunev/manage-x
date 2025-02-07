import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  addGroup,
  Group,
  removeGroup,
  renameGroup,
} from '@/features/groups/groups-slice';
import {
  Cross2Icon,
  Pencil2Icon,
  TrashIcon,
  DotsVerticalIcon,
} from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { v4 as uuidv4 } from 'uuid';
import AppBreadcrumb from '@/components/layout/breadcrumb/AppBreadcrumb';

const Groups: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [editedGroup, setEditedGroup] = useState<Group | null>(null);
  const [editedGroupName, setEditedGroupName] = useState('');
  const groups = useAppSelector((state) => state.groups.entities);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const isAdd = searchParams.has('add');

  const handleEditMode = (group: Group) => {
    setEditedGroup(group);
    setEditedGroupName(group.name);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch(
        addGroup({
          id: uuidv4(),
          name: inputValue.trim(),
          extensions: [],
          active: false,
        }),
      );
      setInputValue('');
    }
  };

  const handleSaveSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    groupId: string,
  ) => {
    e.preventDefault();
    if (editedGroupName.trim() !== '') {
      dispatch(renameGroup({ groupId, name: editedGroupName }));
      setEditedGroup(null);
    }
  };

  return (
    <>
      <AppBreadcrumb currentPath="Groups" />

      {groups?.length > 0 && (
        <div className="mb-4">
          {groups.map((group) => (
            <div className="mb-2 flex gap-2 items-center" key={group.id}>
              {editedGroup?.id === group.id ? (
                <form
                  className="flex flex-1 gap-2 items-center"
                  onSubmit={(e) => handleSaveSubmit(e, group.id)}
                >
                  <div className="flex-1 relative">
                    <Input
                      className="text-sm"
                      value={editedGroupName}
                      onChange={(e) => setEditedGroupName(e.target.value)}
                      required
                    />
                    <Cross2Icon
                      className={`absolute top-3 right-3 cursor-pointer transition-all duration-300 ${
                        editedGroupName ? 'opacity-50' : 'opacity-0'
                      }`}
                      onClick={() => setEditedGroupName('')}
                    />
                  </div>
                  <Button variant="secondary">Save</Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditedGroup(null);
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1">{group.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <DotsVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-4">
                      <DropdownMenuLabel>{group.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditMode(group)}>
                        <Pencil2Icon /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => dispatch(removeGroup(group.id))}
                      >
                        <TrashIcon /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Input
            className="text-sm pr-7"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus={isAdd}
            required
          />
        </div>
        <Cross2Icon
          className={`absolute top-3 right-3 cursor-pointer transition-all duration-300 ${
            inputValue ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setInputValue('')}
        />
        <Button>Add</Button>
      </form>
    </>
  );
};

export default Groups;
