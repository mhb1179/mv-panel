"use client";

import Loading from "@/components/MVui/defaultLoading";
import Title from "@/components/MVui/title";
import FilterInvoices from "@/components/forms/invoices/FilterInvoices";
import InvoicesTable from "@/components/tables/InvoicesTable";
import { getInvoices } from "@/lib/getData";
import { Pagination, PaginationItem } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
function Invoices({ searchParams }) {
  const session = useSession();
  const { sortBy, filterBy, page, search, adminId } = searchParams;
  const [filterParams, setFilterParams] = useState({
    sortBy,
    filterBy,
    search,
    adminId,
  });
  const [pageNumber, setPageNumber] = useState(page);
  const router = useRouter();
  const [invoicePerPage, setInvoicePerPage] = useState(20);
  const [runUseEffect, setRunUseEffect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState();
  useEffect(() => {
    if (session?.status == "loading") return;
    (async () => {
      setInvoices(
        await getInvoices({
          sortBy: filterParams.sortBy,
          filterBy: filterParams.filterBy,
          page: pageNumber,
          search: filterParams.search,
          adminId:
            session?.data?.user.grade != 1 || typeof Number(adminId) != "number"
              ? session?.data?.user.id
              : Number(filterParams.adminId),
          invoicePerPage,
        }),
      );
      setLoading(false);
    })();
  }, [session?.status, runUseEffect, pageNumber]);
  function updateInvoices() {
    setLoading(true);
    setTimeout(() => {
      setRunUseEffect((a) => !a);
    }, 150);
  }
  function paginationChange(event, value) {
    const url = new URL(
      window.location.protocol + window.location.host + window.location.search,
    );
    url.searchParams.set("page", value);
    router.replace("invoices" + url.search);
    setPageNumber(value);
    // updateInvoices();
  }
  function sendSnackBar(message, variant) {
    enqueueSnackbar(message, {
      variant,
    });
  }
  return (
    <>
      <SnackbarProvider
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
      <FilterInvoices
        defaultSearch={search}
        updateInvoices={updateInvoices}
        sendSnackBar={sendSnackBar}
        setFilterParams={setFilterParams}
      />
      <Title>صورتحساب ها</Title>
      {loading || session?.status == "loading" ? (
        <Loading />
      ) : (
        <>
          <InvoicesTable
            page={page || 1}
            invoicePerPage={invoicePerPage}
            invoices={invoices.list}
            updateInvoices={updateInvoices}
            sendSnackBar={sendSnackBar}
          />
          <div className="mt-3 flex flex-col items-center gap-2">
            {Math.ceil(invoices.count / invoicePerPage) <= 1 ? null : (
              <Pagination
                size="small"
                variant="outlined"
                shape="rounded"
                count={Math.ceil(invoices.count / invoicePerPage)}
                defaultPage={Number(pageNumber) || 1}
                siblingCount={1}
                boundaryCount={1}
                onChange={paginationChange}
                renderItem={(item) => (
                  <PaginationItem
                    slots={{
                      previous: ArrowForwardIcon,
                      next: ArrowBackIcon,
                    }}
                    {...item}
                  />
                )}
              />
            )}
            <span className="text-xs">{invoices.count} صورتحساب یافت شد.</span>
          </div>
          <div>
            <span>میزان بدهی: </span>{" "}
            <span className="text-red-500">{invoices.toPay} ت</span>
          </div>
        </>
      )}
    </>
  );
}

export default Invoices;
