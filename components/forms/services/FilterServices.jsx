"use client";
import FormContainer from "@/components/MVui/formContainer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Button,
  Card,
  Collapse,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import { Check } from "lucide-react";
import { Button as Button2 } from "@/components/ui/button";
import { useEffect,  useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "@/components/MVui/defaultLoading";
import { getAllAdmins } from "@/lib/getData";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
const filterByOptions = [
  { label: "همه سرویس ها", value: "all" },
  { label: "سرویس های فعال", value: "enable" },
  { label: "سرویس های غیرفعال", value: "disable" },
  { label: "سرویس های پرداخت نشده", value: "unpaid" },
  { label: "سرویس های اهراز نشده توسط ربات", value: "tgUnregistered" },
];
const sortByOptions = [
  { label: "نزدیکترین تاریخ انقضا", value: "expireSoon" },
  { label: "دورترین تاریخ انقضا", value: "expireLate" },
  { label: "جدید ترین", value: "newest" },
  { label: "قدیمی ترین", value: "oldest" },
  { label: "بیشترین دفعات تمدید", value: "reviveCount" },
];

function FilterServices({
  updateServices,
  defaultSearch,
  sendSnackBar,
  setFilterParams,
}) {
  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminFliterOpen, setAdminFilterOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminIdToFilter, setAdminIdToFilter] = useState("allAdmins");
  const [fliterOpen, setFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState(
    searchParams.get("filterBy") || "all",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const form = useForm();
  useEffect(() => {
    if (defaultSearch) form.setValue("search", defaultSearch);
  }, []);
  useEffect(() => {
    setLoading(true);
    if (session.data?.user.grade == 1) {
      (async () => {
        const getAdmins = await getAllAdmins();
        getAdmins.unshift({ id: "allAdmins", name: "همه ادمین ها" });
        setAdmins(getAdmins);
        setLoading(false);
      })();
    }
    if (session.data?.user.grade > 1) {
      setLoading(false);
    }
  }, [session.status]);

  async function applyFilters() {
    setFilterOpen((a) => !a);
    const url = new URL(window.location.protocol + window.location.host);
    if (sortBy != "newest") url.searchParams.append("sortBy", sortBy);
    if (filterBy != "all") url.searchParams.append("filterBy", filterBy);
    if (adminIdToFilter != "allAdmins")
      url.searchParams.append("adminId", adminIdToFilter);
    if (form.watch("search"))
      url.searchParams.append("search", form.watch("search"));
    router.replace("services" + url.search);
    setFilterParams({
      sortBy: sortBy != "newest" && sortBy,
      filterBy: filterBy != "all" && filterBy,
      search: form.watch("search") && form.watch("search"),
      adminId: adminIdToFilter != "allAdmins" && adminIdToFilter,
    });
    sendSnackBar("تغییرات لیست اعمال شد.", "success");
    updateServices();
  }
  function resetFilter() {
    form.setValue("search", "");
    setFilterBy("all");
    setSortBy("newest");
    setAdminIdToFilter("allAdmins");
    setFilterOpen((a) => !a);
    router.replace(`services`);
    setFilterParams({
      sortBy: undefined,
      filterBy: undefined,
      search: undefined,
      adminId: undefined,
    });
    sendSnackBar("بازگردانی لیست به حالت اولیه", "warning");
    updateServices();
  }
  return (
    <>
      <div className=" mx-auto flex w-full flex-col">
        {/* <Card
          variant="outlined"
          sx={{ background: "#0f172a", padding: "10px" }}
        > */}
        <div className="dir-ltr">
          <Button
            // fullWidth
            // variant="outlined"
            size="small"
            color={"secondary"}
            onClick={() => {
              setFilterOpen((a) => !a);
            }}
          >
            {fliterOpen ? "بستن" : "جستجو و فیلتر"}
          </Button>
        </div>
        <Collapse orientation="vertical" in={fliterOpen}>
          {loading || session.status == "loading" ? (
            <Loading />
          ) : (
            <>
              <Divider sx={{ marginY: "10px" }} />
              <div className="flex flex-col gap-1 md:my-2 md:flex-row">
                <div className="dir-ltr w-full">
                  <TextField
                    id="search"
                    label="جستجو بر اساس نام"
                    {...form.register("search")}
                    size="small"
                    fullWidth
                  />
                </div>
                <Divider sx={{ marginY: "10px" }} />
                <TextField
                  value={filterBy}
                  size="small"
                  id="filterBy"
                  label="فیلتر کردن بر اساس"
                  onChange={(e) => {
                    setFilterBy(e.target.value);
                  }}
                  fullWidth
                  select
                >
                  {filterByOptions.map((filterByOption) => {
                    return (
                      <MenuItem
                        key={filterByOption.value}
                        value={filterByOption.value}
                      >
                        {filterByOption.label}
                      </MenuItem>
                    );
                  })}
                </TextField>
                <Divider sx={{ marginY: "10px" }} />
                <TextField
                  value={sortBy}
                  size="small"
                  id="sortBy"
                  label="مرتب کردن بر اساس"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                  }}
                  fullWidth
                  select
                >
                  {sortByOptions.map((sortByOption) => {
                    return (
                      <MenuItem
                        key={sortByOption.value}
                        value={sortByOption.value}
                      >
                        {sortByOption.label}
                      </MenuItem>
                    );
                  })}
                </TextField>
                {session.data.user.grade == 1 ? (
                  <>
                    <Divider sx={{ marginY: "10px" }} />
                    <span></span>
                    <Popover
                      open={adminFliterOpen}
                      onOpenChange={setAdminFilterOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button2
                          variant="outline"
                          role="combobox"
                          aria-expanded={adminFliterOpen}
                          className="w-full justify-between bg-slate-900"
                        >
                          {adminIdToFilter
                            ? admins.find(
                                (admin) => admin.id == adminIdToFilter,
                              )?.name
                            : " ادمین را انتخاب کنید"}
                        </Button2>
                      </PopoverTrigger>
                      <PopoverContent className="w-[250px] p-0">
                        <Command className="bg-slate-900 text-white">
                          <CommandInput placeholder="جستجوی ادمین" />
                          <CommandEmpty>ادمینی یافت نشد</CommandEmpty>
                          <CommandGroup className=" text-white">
                            {admins.map((admin) => (
                              <CommandItem
                                key={admin.id}
                                onSelect={(currentValue) => {
                                  setAdminIdToFilter(admin.id);
                                  setAdminFilterOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    adminIdToFilter === admin.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {admin.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : null}

                <Divider sx={{ marginY: "10px" }} />
              </div>
              <div className="mx-auto grid w-full grid-cols-9 gap-1 md:max-w-lg md:gap-3">
                <div className=" col-span-7">
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    color={"success"}
                    onClick={applyFilters}
                  >
                    اعمال تغییرات
                  </Button>
                </div>
                <div className=" col-span-2 ">
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    color={"warning"}
                    onClick={resetFilter}
                  >
                    ریست
                  </Button>
                </div>
              </div>
            </>
          )}
        </Collapse>
        {/* </Card> */}
      </div>
    </>
  );
}

export default FilterServices;
