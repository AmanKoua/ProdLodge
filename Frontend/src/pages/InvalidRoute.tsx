import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InvalidRoute = () => {
  const navigate = useNavigate();

  //   useEffect(() => {
  //     setTimeout(() => {
  //       navigate("/");
  //     }, 3000);
  //   }, []);

  return (
    <div className="bg-prodPrimary w-full h-screen pt-56">
      <div className=" w-7/12 h-max ml-auto mr-auto bg-prodSecondary rounded-lg z-50">
        <h3 className="ml-auto mr-auto p-5 font-bold text-4xl">
          We're sorry, but we can't find the page you're looking for!
        </h3>
      </div>
    </div>
  );
};

export default InvalidRoute;
