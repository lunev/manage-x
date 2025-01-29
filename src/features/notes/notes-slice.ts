import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note } from '@/types/';

type NotesState = {
  data: Note[];
};

const initialState: NotesState = {
  data: [],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    add(state, action: PayloadAction<Note>) {
      state.data.push(action.payload);
    },
    remove(state, action: PayloadAction<Note>) {
      state.data = state.data.filter((note) => note.id !== action.payload.id);
    },
    update(state, action: PayloadAction<Note>) {
      const index = state.data.findIndex(
        (note) => note.id === action.payload.id,
      );
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
  },
});

export const { add, remove, update } = notesSlice.actions;
export default notesSlice.reducer;
