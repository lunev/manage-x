import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export type Group = {
  id: string;
  name: string;
  extensions: string[];
  active: boolean;
};

type GroupsState = {
  entities: Group[];
};

const initialState: GroupsState = {
  entities: [
    {
      id: uuidv4(),
      name: 'Work',
      extensions: [],
      active: false,
    },
    {
      id: uuidv4(),
      name: 'Development',
      extensions: [],
      active: false,
    },
  ],
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    addGroup(state, action: PayloadAction<Group>) {
      state.entities.push(action.payload);
    },
    renameGroup(
      state,
      action: PayloadAction<{ groupId: string; name: string }>,
    ) {
      const { groupId, name } = action.payload;
      const group = state.entities.find((group) => group.id === groupId);
      if (group) {
        group.name = name;
      }
    },
    removeGroup(state, action: PayloadAction<string>) {
      const groups = state.entities.filter(
        (group) => group.id !== action.payload,
      );
      state.entities = groups;
    },
    setActiveGroup(state, action: PayloadAction<Group | null>) {
      state.entities.forEach((group) => {
        group.active = group.id === action.payload?.id;
      });
    },
    moveExtensionToGroup(
      state,
      action: PayloadAction<{ groupId: string; extensionId: string }>,
    ) {
      const { groupId, extensionId } = action.payload;

      state.entities.forEach((group) => {
        group.extensions = group.extensions.filter((id) => id !== extensionId);
      });

      const newGroup = state.entities.find((g) => g.id === groupId);
      if (newGroup && !newGroup.extensions.includes(extensionId)) {
        newGroup.extensions.push(extensionId);
      }
    },
  },
});

export const {
  addGroup,
  renameGroup,
  removeGroup,
  moveExtensionToGroup,
  setActiveGroup,
} = groupsSlice.actions;
export default groupsSlice.reducer;
