import React, { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LocomotiveScrollProvider,
  useLocomotiveScroll,
} from "react-locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

const Landing = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const navigate = useNavigate();

  return (
    <LocomotiveScrollProvider
      options={{
        smooth: true,
        // ... all available Locomotive Scroll instance options
      }}
      watch={[
        location.pathname,
        //..all the dependencies you want to watch to update the scroll.
        //  Basicaly, you would want to watch page/location changes
        //  For exemple, on Next.js you would want to watch properties like `router.asPath` (you may want to add more criterias if the instance should be update on locations with query parameters)
      ]}
      containerRef={containerRef}
    >
      <main data-scroll-container ref={containerRef}>
        <div
          data-scroll-section
          className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 w-full mr-auto ml-auto pb-4 hide-scrollbar overflow-y-hidden"
          style={{ minHeight: "115vh" }}
        >
          <div className="h-max w-max ml-auto mr-auto mt-10">
            <h1 className="w-max ml-auto mr-auto mt-auto text-6xl">
              Welcome to ProdLodge!
            </h1>
            <h1
              data-scroll
              data-scroll-speed="-5"
              className="w-max ml-auto text-xl"
            >
              Welcome to ProdLodge!
            </h1>
          </div>

          <button
            onClick={() => {
              navigate("/home");
            }}
          >
            lmao
          </button>
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
};

export default Landing;
