import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

import studio from "../assets/img/studio.jpg";
import dive from "../assets/img/dive.jpg";

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
                // data-scroll-delay={0.25 - idx / 80}
                data-scroll-speed={1}
                className="sm:text-5xl lg:text-7xl"
                key={idx}
              >
                {item}
              </h1>
            );
          } else {
            return (
              <h1
                data-scroll
                // data-scroll-delay={idx / 70}
                data-scroll-speed={1}
                className="sm:text-5xl lg:text-7xl opacity-0"
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
      <main className="ScrollApp" data-scroll-container ref={containerRef}>
        <div
          data-scroll-section
          className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 w-full mr-auto ml-auto pb-4 hide-scrollbar overflow-y-hidden flex flex-col"
          style={{ minHeight: "280vh" }}
        >
          <div className="h-14 w-max ml-auto mr-auto mt-12 flex flex-row">
            {generateFXText("Welcome to ProdLodge!")}
          </div>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto mt-2 mb-2"></div>
          <Section1></Section1>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto mt-2 mb-2"></div>
          <Section2></Section2>
          {/* <button
            onClick={() => {
              navigate("/home");
            }}
          >
            Navigate to home!
          </button> */}
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
};

const Section1 = (): JSX.Element => {
  const img1 = useRef<HTMLImageElement>(null);
  const img2 = useRef<HTMLImageElement>(null);
  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLHeadingElement>(null);
  const mainDivRef = useRef<HTMLDivElement>(null);
  const [imageStyle, setImageStyle] = useState<Object>({
    width: "45.83%",
    height: "70vh",
    objectFit: "cover",
    transition: "all 0.1s",
  });
  const [overlayOffset, setOverlayOffset] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!img1 || !img1.current) {
      return;
    }

    setOverlayOffset(img1.current.height / 100);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((e) => {
      for (const entry of e) {
        // console.log(entry.devicePixelContentBoxSize[0].inlineSize);
        // console.log(entry.contentRect.height);

        if (entry.contentRect.height > 540) {
          // small screen image style
          setImageStyle({
            width: "91.6%",
            // height: "53.5vh",
            height: `${entry.contentRect.height / 2}px`,
            objectFit: "cover",
            transition: "all 0.1s",
          });
        } else {
          setImageStyle({
            // large screen image style
            width: "45.83%",
            // height: "70vh",
            height: `${entry.contentRect.height}px`,
            objectFit: "cover",
            transition: "all 0.1s",
          });
        }
      }
    });

    if (mainDivRef && mainDivRef.current) {
      observer.observe(mainDivRef.current);
    }

    return () => {
      if (mainDivRef && mainDivRef.current) {
        observer.unobserve(mainDivRef.current);
      }
    };
  }, [mainDivRef]);

  return (
    <div
      className="w-11/12 ml-auto mr-auto flex flex-col sm:flex-row justify-around"
      style={{ minHeight: "70vh", maxHeight: "140vh" }}
      ref={mainDivRef}
    >
      <div
        className="hover:shadow-xl w-12/12 sm:w-6/12 h-6/6 mr-auto flex flex-col justify-around overflow-y-hidden"
        style={{ transition: "all 0.8s" }}
        onMouseEnter={() => {
          img1.current!.style.opacity = "0%";
          img1.current!.style.zIndex = "-10";
          text1Ref.current!.style.opacity = "0%";
          text1Ref.current!.style.zIndex = "-10";
        }}
        onMouseLeave={() => {
          img1.current!.style.opacity = "100%";
          img1.current!.style.zIndex = "10";
          text1Ref.current!.style.opacity = "100%";
          text1Ref.current!.style.zIndex = "11";
        }}
      >
        <h1
          className="text-white h-max z-20 absolute text-center"
          style={{
            width: "45.83%",
            marginTop: overlayOffset,
            transition: "all .1s",
          }}
          ref={text1Ref}
          data-scroll
          data-scroll-speed="1.3"
        >
          New Here?
        </h1>
        <img
          className="absolute z-10"
          style={imageStyle}
          ref={img1}
          src={studio}
        />
        <h1 className="w-max ml-auto mr-auto text-4xl pt-3 font-light">
          New Here?
        </h1>
        <h1 className="w-11/12 ml-auto mr-auto text-xl pt-3 font-light text-center">
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
        <div className="w-10/12 h-max mb-10 ml-auto mr-auto flex flex-row">
          <div
            className="border border-blue-300 rounded-sm p-2 w-max h-max shadow-md hover:shadow-lg ml-auto mr-auto mt-auto mb-auto"
            onClick={() => {
              navigate("/about");
            }}
          >
            Learn More
          </div>
        </div>
      </div>
      <div
        className="w-2 ml-auto mr-auto mt-auto mb-auto rounded-xl hidden"
        style={{ height: "65vh" }}
        // vertical divider
      ></div>
      <div
        className="hover:shadow-xl w-12/12 sm:w-6/12 h-6/6 ml-auto flex flex-col justify-around overflow-y-hidden"
        style={{ transition: "all 0.8s" }}
        onMouseEnter={() => {
          img2.current!.style.opacity = "0%";
          img2.current!.style.zIndex = "-10";
          text2Ref.current!.style.opacity = "0%";
          text2Ref.current!.style.zIndex = "-10";
        }}
        onMouseLeave={() => {
          img2.current!.style.opacity = "100%";
          img2.current!.style.zIndex = "10";
          text2Ref.current!.style.opacity = "100%";
          text2Ref.current!.style.zIndex = "11";
        }}
      >
        <h1
          className="text-white h-max z-20 absolute text-center"
          style={{
            width: "45.83%",
            marginTop: overlayOffset,
            transition: "all .1s",
          }}
          ref={text2Ref}
          data-scroll
          data-scroll-speed="1.3"
        >
          Dive In
        </h1>
        <img
          className="w-full absolute z-10"
          style={imageStyle}
          ref={img2}
          src={dive}
        />
        <h1 className="w-max ml-auto mr-auto text-4xl pt-3 font-light">
          Dive in
        </h1>
        <h1 className="w-11/12 ml-auto mr-auto text-xl pt-3 font-light text-center">
          If you're an experienced ProdLodge user, or are simply ready to get
          right into it, click the buttons below to sign up or log in.
          <br></br>
          <br></br>
          After signing up or logging in, you will have full reign to explore
          and play with the functionalities of ProdLodge!
          <br></br>
          <br></br>
          Get going now!
        </h1>
        <div className="w-8/12 h-max ml-auto mr-auto mb-10 flex flex-row">
          <div
            className="border border-blue-300 rounded-sm p-2 w-max h-max shadow-md hover:shadow-lg mt-auto mb-auto ml-auto mr-auto"
            onClick={() => {
              navigate("/login");
            }}
          >
            Log In
          </div>
          <div
            className="border border-blue-300 rounded-sm p-2 w-max h-max shadow-md hover:shadow-lg mt-auto mb-auto ml-auto mr-auto"
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign Up
          </div>
        </div>
      </div>
    </div>
  );
};

const Section2 = (): JSX.Element => {
  return (
    <div
      className="w-11/12 ml-auto mr-auto flex flex-col sm:flex-row justify-around"
      style={{ minHeight: "70vh", maxHeight: "140vh" }}
    >
      <div
        className="hover:shadow-xl w-12/12 sm:w-6/12 h-6/6 mr-auto flex flex-col justify-around overflow-y-hidden"
        style={{ transition: "all 0.8s" }}
      >
        <h1 className="w-max ml-auto mr-auto mt-5 text-4xl pt-3 font-light">
          How to get started
        </h1>
        <h1 className="w-11/12 ml-auto mr-auto text-xl pt-3 font-light text-center">
          Log in or sign up, and add all of your friends via their email
          accounts.
          <br></br>
          <br></br>
          Upload a song and set it's visibility to public, private, or friends
          only.
          <br></br>
          <br></br>
          Use the provided audio modules to create different configurations and
          share them with your friends or the public!
        </h1>
        <div className="w-10/12 h-max ml-auto mr-auto flex flex-row opacity-0">
          <div className="border border-blue-300 rounded-sm p-2 w-max h-max shadow-md hover:shadow-lg ml-auto mr-auto mt-auto mb-auto">
            Learn More
          </div>
        </div>
      </div>
      <div
        className="w-2 ml-auto mr-auto mt-auto mb-auto rounded-xl hidden"
        style={{ height: "65vh" }}
        // vertical divider
      ></div>
      <div
        className=" hover:shadow-xl w-full sm:w-6/12 h-6/6 mr-auto flex flex-row overflow-hidden"
        style={{ transition: "all 0.8s" }}
      >
        <div className="bg-red-900 w-4/6 h-full mr-auto">a</div>
        <div className="bg-blue-500 w-2/6 h-full ml-auto flex flex-col">
          <h1 className="w-max ml-auto mr-auto text-3xl font-light mt-2">
            Modules
          </h1>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
          <div className="bg-purple-200 w-full h-12 mb-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
