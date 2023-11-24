import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

const Landing = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  return (
    <LocomotiveScrollProvider
      options={{
        smooth: true,
        // ... all available Locomotive Scroll instance options
      }}
      watch={[
        "router.asPath",
        //..all the dependencies you want to watch to update the scroll.
        //  Basicaly, you would want to watch page/location changes
        //  For exemple, on Next.js you would want to watch properties like `router.asPath` (you may want to add more criterias if the instance should be update on locations with query parameters)
      ]}
      containerRef={containerRef}
    >
      <div
        data-scroll-container="true"
        ref={containerRef}
        className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 w-full mr-auto ml-auto pb-4 hide-scrollbar overflow-y-hidden"
        style={{ minHeight: "115vh" }}
      >
        <h1 className="w-max border-2 ml-auto mr-auto">
          Welcome to ProdLodge!
        </h1>
        <button
          onClick={() => {
            navigate("/home");
          }}
        >
          lmao
        </button>
      </div>
    </LocomotiveScrollProvider>
  );
};

export default Landing;
