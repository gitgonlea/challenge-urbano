import { useState } from 'react';
import { AlertTriangle, Loader, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import Course from '../../models/course/Course';
import UpdateCourseRequest from '../../models/course/UpdateCourseRequest';
import courseService from '../../services/CourseService';
import Modal from '../shared/Modal';
import Table from '../shared/Table';
import TableItem from '../shared/TableItem';

interface UsersTableProps {
  data: Course[];
  isLoading: boolean;
}

export default function CoursesTable({
  data = [],
  isLoading,
}: UsersTableProps) {
  const { authenticatedUser } = useAuth();
  const [deleteShow, setDeleteShow] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const [error, setError] = useState<string>();
  const [updateShow, setUpdateShow] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<UpdateCourseRequest>();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await courseService.delete(selectedCourseId);
      setDeleteShow(false);
      setError(null);
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (updateCourseRequest: UpdateCourseRequest) => {
    try {
      await courseService.update(selectedCourseId, updateCourseRequest);
      setUpdateShow(false);
      reset();
      setError(null);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <>
      <div className="table-container">
        <Table columns={['Name', 'Description', 'Created', '']}>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="text-center py-5">
                <Loader className="mx-auto animate-spin" />
              </td>
            </tr>
          ) : (
            data.map(({ id, name, description, dateCreated }) => (
              <tr key={id}>
                <TableItem>
                  <Link to={`/courses/${id}`}>{name}</Link>
                </TableItem>
                <TableItem>{description}</TableItem>
                <TableItem>
                  {new Date(dateCreated).toLocaleDateString()}
                </TableItem>
                <TableItem className="text-right">
                  {['admin', 'editor'].includes(authenticatedUser.role) && (
                    <button
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      onClick={() => {
                        setSelectedCourseId(id);
                        setValue('name', name);
                        setValue('description', description);
                        setUpdateShow(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {authenticatedUser.role === 'admin' && (
                    <button
                      className="text-red-600 hover:text-red-900 ml-3 focus:outline-none"
                      onClick={() => {
                        setSelectedCourseId(id);
                        setDeleteShow(true);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </TableItem>
              </tr>
            ))
          )}
        </Table>
        {!isLoading && data.length < 1 && (
          <div className="text-center my-5 text-gray-500">
            <h1>No courses found.</h1>
          </div>
        )}
      </div>
      {/* Delete Course Modal */}
      <Modal show={deleteShow}>
        <AlertTriangle size={30} className="text-red-500 mr-5 fixed" />
        <div className="ml-10">
          <h3 className="mb-2 font-semibold">Delete Course</h3>
          <hr />
          <p className="mt-2">
            Are you sure you want to delete this course? All of the course's
            data will be permanently removed.
            <br />
            This action cannot be undone.
          </p>
        </div>
        <div className="flex flex-row gap-3 justify-end mt-5">
          <button
            className="btn"
            onClick={() => {
              setError(null);
              setDeleteShow(false);
            }}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader className="mx-auto animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-500 p-3 mt-4 font-semibold border rounded-md bg-red-50">
            {error}
          </div>
        )}
      </Modal>
      {/* Update Course Modal */}
      <Modal show={updateShow}>
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-lg">Update Course</h1>
          <button
            className="focus:outline-none"
            onClick={() => {
              setUpdateShow(false);
              setError(null);
              reset();
            }}
          >
            <X size={24} />
          </button>
        </div>
        <hr className="my-3" />

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(handleUpdate)}
        >
          <input
            type="text"
            className="input"
            placeholder="Name"
            required
            {...register('name')}
          />
          <input
            type="text"
            className="input"
            placeholder="Description"
            required
            disabled={isSubmitting}
            {...register('description')}
          />
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              'Save Changes'
            )}
          </button>
          {error && (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
