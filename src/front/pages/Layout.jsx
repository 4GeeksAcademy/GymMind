import { Outlet, useLocation } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"
//import { Navbar } from "../components/Navbar"
//import { Footer } from "../components/Footer"

export const Layout = () => {
    const location = useLocation();
    const hideNavFooter = location.pathname === "/profile" || location.pathname === "/edit-profile";

    return (
        <ScrollToTop>
            {!hideNavFooter && <Navbar />}
            <Outlet />
            {!hideNavFooter && <Footer />}
        </ScrollToTop>
    )
}