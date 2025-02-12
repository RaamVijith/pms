import Modal from "../../../components/modals/MainModal";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useGlobalContext } from "../../../context/GlobalContext";
import { useCollectorContext } from "../../../context/CollectorContext";
import { useMutation, useQueryClient } from "react-query";
import { collectorClient } from "../../../api/collectors";

const DeleteCollectorModel = () => {
  const { setDeleteModalOpen, setLoading, setSnackMessage, setSnackOpen } =
    useGlobalContext();
  const { deleteCollector } = collectorClient;
  const { selectedCollector } = useCollectorContext();

  console.log(selectedCollector);

  const queryClient = useQueryClient();

  const { isLoading, mutate } = useMutation(
    async () => await deleteCollector(selectedCollector?._id!),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("all collectors");
        setLoading(false);
        setSnackMessage(data.message);
        setSnackOpen(true);
      },
      onError: (error: any) => {
        console.log(error);
        setSnackMessage(error.message);
        setSnackOpen(true);
      },
      onSettled: () => {
        setLoading(false);
        setDeleteModalOpen(false);
      },
    }
  );

  return (
    <Modal title="delete collector" type="delete">
      <DialogContent>
        <DialogContentText>
          Do you want to delete this collector from your list?
        </DialogContentText>
        <DialogActions>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            variant="outlined"
            color="warning"
          >
            cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => mutate()}
            disabled={isLoading}
          >
            delete
          </Button>
        </DialogActions>
      </DialogContent>
    </Modal>
  );
};

export default DeleteCollectorModel;
