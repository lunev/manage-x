import { useForm, SubmitHandler } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { add, remove } from '@/features/notes/notes-slice';
import { Note } from '@/types';

const Dashboard: React.FC = () => {
  const { data: notes } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Note>();

  const onSubmit: SubmitHandler<Note> = (data) => {
    const newNote = { ...data, id: Date.now().toString() };
    dispatch(add(newNote));
    reset();
  };

  return (
    <div data-testid="dashboard">
      <h2 className="sr-only">Dashboard</h2>
      {notes && notes.length > 0 ? (
        <div className="mb-2">
          {notes.map((note) => (
            <div key={note.id} className="flex mb-1 items-center note">
              <div className="title flex-1 pr-2">{note.title}</div>
              <div className="actions">
                <button
                  className="text-red-500"
                  onClick={() => dispatch(remove(note))}
                  aria-label={`Remove note: ${note.title}`}
                >
                  &#10005;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-2">There are no notes yet.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} role="form">
        <div className="flex">
          <input
            type="text"
            className="form-control flex-1 mr-2"
            {...register('title', { required: 'Title is required' })}
          />
          <button className="btn-outlined">add</button>
        </div>
        {errors.title && (
          <p className="mt-2 text-red-500">{errors.title.message}</p>
        )}
      </form>
    </div>
  );
};

export default Dashboard;
