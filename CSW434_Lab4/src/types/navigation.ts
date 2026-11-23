export type NoteItem = {
  id: string;
  title: string;
  content: string;
  color: string;
};

export type RootStackParamList = {
  Notes: { uid: string };
  EditNote: { uid: string; note: NoteItem | null };
};
