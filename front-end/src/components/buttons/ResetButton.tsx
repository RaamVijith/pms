import Button from "@mui/material/Button";
import { useGlobalContext } from "../../context/GlobalContext";
import { usePaymentContext } from "../../context/PaymentContext";

const ResetButton = () => {
  const { resetParams } = useGlobalContext();
  const { setCheckedPayments } = usePaymentContext();
  return (
    <Button
      onClick={() => {
        setCheckedPayments([]);
        resetParams({});
      }}
      variant="contained"
      sx={{ ml: 1 }}
    >
      Reset Filters
    </Button>
  );
};

export default ResetButton;
