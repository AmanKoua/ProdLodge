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

  useEffect(() => {
    // If logged in, do not show the landing page
    if (localStorage.getItem("user")) {
      navigate("/home");
    }
  }, []);

  const generateFXText = (text: string): JSX.Element => {
    let tempArr: string[] = [];

    for (let i = 0; i < text.length; i++) {
      tempArr.push(text[i]);
    }

    return (
      <>
        {tempArr.map((item, idx) => {
          if (item != " ") {
            return (
              <h1
                data-scroll
                data-scroll-delay={0.25 - idx / 80}
                data-scroll-speed={1}
                className="text-7xl"
                key={idx}
              >
                {item}
              </h1>
            );
          } else {
            return (
              <h1
                data-scroll
                data-scroll-delay={idx / 70}
                data-scroll-speed={1}
                className="text-6xl opacity-0"
                key={idx}
              >
                {"i"}
              </h1>
            );
          }
        })}
      </>
    );

    return <></>;
  };

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
          className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 w-full mr-auto ml-auto pb-4 hide-scrollbar overflow-y-hidden flex flex-col"
          style={{ minHeight: "200vh" }}
        >
          <div className="h-max w-max ml-auto mr-auto mt-12 flex flex-row">
            {generateFXText("Welcome to ProdLodge!")}
          </div>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto"></div>
          <Section1></Section1>
          <button
            onClick={() => {
              navigate("/home");
            }}
          >
            Navigate to home!
          </button>
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
};

const Section1 = (): JSX.Element => {
  return (
    <div
      className="bg-red-200 w-11/12 ml-auto mr-auto flex flex-row justify-around"
      style={{ minHeight: "70vh" }}
    >
      <div className="bg-green-400 w-6/12 mr-auto flex flex-col">
        <h1 className="w-max ml-auto mr-auto text-4xl pt-3 font-light">
          New Here?
        </h1>
        <h1 className="w-11/12 ml-auto mr-auto text-xl pt-3 font-light">
          ProdLodge is a place where a community of music producers, sound
          designers, and audio engineers share their ideas.
          <br></br>
          <br></br>
          It utilizes the web audio API to provide users with a rich and
          powerful audio editing experience, all from within the web browser!
          <br></br>
          <br></br>
          To learn more, click the link below!
        </h1>
        <div className=" border border-gray-400 p-2 w-max h-max shadow-sm hover:shadow-lg ml-auto mr-auto mt-5">
          Learn More!
        </div>
      </div>
      <div
        className="w-1 border-l-2 border-gray-400 ml-auto mr-auto mt-auto mb-auto rounded-xl"
        style={{ height: "65vh" }}
      ></div>
      <div className="bg-purple-400 w-6/12 ml-auto"></div>
    </div>
  );
};

export default Landing;