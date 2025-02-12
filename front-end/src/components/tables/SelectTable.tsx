import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { createPaymentData } from "./data";
import _ from "underscore";
import { useGlobalContext } from "../../context/GlobalContext";
import { useCollectorContext } from "../../context/CollectorContext";
import { IPayment, queryPayments } from "../../api/client";
import { useShopContext } from "../../context/ShopContext";
import { useQuery } from "react-query";
import { useMemo, useState } from "react";
import { write, utils, writeFile } from "xlsx";
import { Box, Button, CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import GridOnIcon from "@mui/icons-material/GridOn";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs, { Dayjs } from "dayjs";
import Typography from "@mui/material/Typography";

const PaymentTableSelect = () => {
  //report states
  const [payments, setAllPayments] = useState<IPayment[] | null>();
  const [params, setParams] = useState({});
  //

  //for date picker
  const [from, setFrom] = useState<Dayjs | null>(dayjs());
  const [to, setTo] = useState<Dayjs | null>(dayjs());
  //

  const { companies } = useGlobalContext();
  const { collectors } = useCollectorContext();
  const { shops } = useShopContext();

  const columns = useMemo<
    MRT_ColumnDef<ReturnType<typeof createPaymentData>>[]
  >(
    () => [
      { accessorKey: "invoice", header: "Invoice", size: 50 },
      { accessorKey: "shop", header: "Shop", size: 50 },
      {
        accessorKey: "company",
        header: "Company",
        size: 50,
        filterVariant: "multi-select",
        filterSelectOptions: companies.map((c) => c.name),
      },
      {
        accessorKey: "area",
        header: "Area",
        size: 50,
        filterVariant: "multi-select",
        filterSelectOptions: Array.from(
          new Set(shops.map((c) => c.region.name))
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "free",
        header: "Free",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "discount",
        header: "Discount",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "paidAmount",
        header: "paid",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "returnAmount",
        header: "return",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "marketReturn",
        header: "market",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "dueAmount",
        header: "due",
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: {
          align: "right",
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: "paymentStatus",
        header: "Status",
        maxSize: 5,
        size: 30,
        filterVariant: "select",
        filterSelectOptions: ["PAID", "DUE"],
      },
      {
        accessorKey: "collector",
        header: "Collector",
        maxSize: 5,
        filterVariant: "select",
        filterSelectOptions: collectors.map((c) => c.name),
      },
      { accessorKey: "paymentDate", header: "Payment Date", maxSize: 6 },
    ],
    []
  );

  const { isLoading, refetch } = useQuery(
    "all reports",
    async () => await queryPayments(params),
    {
      enabled: false,
      onSuccess: (data) => setAllPayments(data.payments),
    }
  );

  // util function for excelsheet download
  const downloadExcel = (paymentData: any) => {
    const workSheet = utils.json_to_sheet(paymentData);
    const workBook = utils.book_new();
    utils.book_append_sheet(workBook, workSheet, "payments");

    const buff = write(workBook, { type: "buffer", bookType: "xlsx" });
    writeFile(workBook, "paymentData.xlsx");
  };
  //

  //function for pdf export
  const exportPdf = (cols: any, data: any) => {
    const doc = new jsPDF();
    doc.text(`Payments - ${dayjs().format("DD/MM/YYYY")}`, 5, 10);
    autoTable(doc, {
      head: [cols],
      body: data,
    });
    doc.save("table.pdf");
  };
  //

  //date picker utils functions
  const handleChangeFrom = (newValue: Dayjs | null) => {
    setFrom(newValue);
  };
  const handleChangeTo = (newValue: Dayjs | null) => {
    setTo(newValue);
  };
  //

  return (
    <>
      <Typography sx={{ mb: 0.8 }}>select a date range</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" alignItems="flex-end" mb={2}>
          <DesktopDatePicker
            label="From"
            inputFormat="MM/DD/YYYY"
            value={from}
            onChange={handleChangeFrom}
            renderInput={(params) => (
              <TextField {...params} sx={{ mr: 1 }} size="small" />
            )}
          />
          <DesktopDatePicker
            label="To"
            inputFormat="MM/DD/YYYY"
            value={to}
            onChange={handleChangeTo}
            renderInput={(params) => (
              <TextField {...params} sx={{ mr: 1 }} size="small" />
            )}
          />
          <Button
            variant="contained"
            onClick={() => {
              setParams({ from, to });
              refetch();
            }}
          >
            {isLoading ? <CircularProgress /> : "Fetch Payments"}
          </Button>
        </Box>
      </LocalizationProvider>
      <MaterialReactTable
        columns={columns}
        data={payments ? payments.map((d) => createPaymentData(d)) : []}
        state={{ isLoading }}
        initialState={{ showColumnFilters: true }}
        enableRowSelection
        renderTopToolbarCustomActions={({ table }) => (
          <Box
            sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}
          >
            <Button
              color="primary"
              disabled={!table.getIsSomeRowsSelected}
              onClick={() => {
                let cols = table.getVisibleFlatColumns().map((c) => ({
                  id: c.id,
                  header: c.columnDef.header as string,
                }));

                let rows = table
                  .getSelectedRowModel()
                  .rows.map((r) => r.original);

                const data = rows.map((row) => {
                  let obj: any = {};
                  cols.map((col) => {
                    obj[col.header] = row[col.id as keyof typeof row];
                  });
                  return obj;
                });

                downloadExcel(data);
              }}
              startIcon={<GridOnIcon />}
              variant="outlined"
            >
              Export to Excel
            </Button>
            <Button
              color="primary"
              disabled={!table.getIsSomeRowsSelected}
              startIcon={<PictureAsPdfIcon />}
              variant="outlined"
              onClick={() => {
                let cols = table
                  .getVisibleFlatColumns()
                  .map((c) => c.columnDef.header)
                  .filter((c) => c !== "Select") as string[];

                let colIds = table
                  .getVisibleFlatColumns()
                  .map((c) => c.id)
                  .filter((c) => c !== "mrt-row-select");

                let rows = table
                  .getSelectedRowModel()
                  .rows.map((r) => r.original)
                  .map((r) => {
                    let temp: any[] = [];
                    colIds.map((c) => {
                      if (r[c as keyof typeof r] !== null) {
                        temp.push(r[c as keyof typeof r].toString());
                      }
                    });
                    return temp;
                  });

                exportPdf(cols, rows);
              }}
            >
              export pdf
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                table.resetColumnFilters();
              }}
            >
              reset filters
            </Button>
          </Box>
        )}
      />
    </>
  );
};

export default PaymentTableSelect;
