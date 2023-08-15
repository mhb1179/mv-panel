"use client";
import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { AppBar, Button, IconButton, Toolbar ,Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {  useState } from "react";
import { useRouter } from "next/navigation";
import { signOut , useSession} from "next-auth/react";
const list = [
  { title: "افزودن سرویس", href: "/dashboard/addService" },
  { title: "سرویس ها", href: "/dashboard/services" },
  { title: "صورتحساب ها", href: "/dashboard/invoices" },
  { title: "تنظیمات", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((a) => !a);
  };
  const session = useSession();
  const router = useRouter();
  return (<>
      <AppBar position="sticky" sx={{ backgroundColor: "#2e1065" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>

          <h1 className="mx-auto cursor-pointer" onClick={()=>{router.push("/dashboard")}}>داشبورد</h1>

          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              signOut()
            }}
          >
            خروج
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={isOpen}
        onClick={toggleDrawer}
        onClose={() => {
        }}
      >
        <div className="flex flex-col gap-3 justify-center items-center p-6 bg-violet-950">
          <Avatar sx={{ width: "60px", height: "60px" }} />
          <h1 className="text-slate-50 font-extrabold">{session?.data?.user.name}</h1>
        </div>

        <List
          sx={{ width: "250px", backgroundColor: "#2e1065", height: "100svh" }}
        >
          {list.map((listItem) => {
            return (
              <div key={listItem.title}>
                <Divider />
                <ListItem>
                  <ListItemButton onClick={()=>{router.push(listItem.href)}}>
                    <ListItemText>
                      <p className="text-slate-50 text-center">
                        {listItem.title}
                      </p>
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
