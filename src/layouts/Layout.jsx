import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";

import Header from "./Header";

import NewPromptModal from "../pages/PromptManagement/components/NewPromptModal";

import DetailModal from "../pages/PromptManagement/components/DetailModal";

import useGetDetailData from "../pages/PromptManagement/hooks/useGetDetailData";

import { SuccessPopOut } from "../components/SuccessPopOut";
import GlobalAccessGuard from "../components/protected/GlobalAccessGuard";

const Layout = () => {
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("authType");

    if (auth && location.pathname === "/login") {
      navigate("/");
    }

    if (!auth && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [location.pathname, navigate]);

  const noSidebarRoutes = ["/login"];

  const showSidebar = !noSidebarRoutes.includes(location.pathname);
  console.log(showSidebar)

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenDetail, setIsModalOpenDetail] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, isError } = useGetDetailData(selectedId);

  return (
    <div className="flex min-h-screen relative">
      {showSidebar && <Sidebar />}

      <div className="flex flex-col flex-1 mt-12 mr-10 ml-20 md:ml-72">
        {showSidebar && <Header />}

        <main className="flex-1 px-8 pt-5 bg-[#F9FAFB] overflow-auto relative mx-2 mr-0 pr-0">
          <GlobalAccessGuard>
            <Outlet
              context={{
                isModalOpen,

                setIsModalOpen,

                isModalOpenDetail,

                setIsModalOpenDetail,

                setSelectedId,
              }}
            />
          </GlobalAccessGuard>
        </main>
      </div>

      <NewPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          SuccessPopOut("Success", "success", "Prompt is successfully added.");
        }}
      />

      {isModalOpenDetail && (
        <DetailModal
          isOpen={isModalOpenDetail}
          onClose={() => setIsModalOpenDetail(false)}
          data={data}
          isLoading={isLoading}
          isError={isError}
        />
      )}
    </div>
  );
};

export default Layout;
