import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

import studio from "../assets/img/studio.jpg";
import dive from "../assets/img/dive.jpg";
import started from "../assets/img/started.jpg";
import modules from "../assets/img/modules.jpg";
import aman from "../assets/img/aman.jpg";

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
          className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 w-full h-max mr-auto ml-auto pb-20 hide-scrollbar overflow-y-hidden flex flex-col"
          style={{ minHeight: "250vh" }}
        >
          <div className="h-14 w-max ml-auto mr-auto mt-12 flex flex-row">
            {generateFXText("Welcome to ProdLodge!")}
          </div>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto mt-2 mb-2"></div>
          <Section1></Section1>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto mt-2 mb-2"></div>
          <Section2></Section2>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto mt-2 mb-2"></div>
          <Section3></Section3>
          <div className="w-11/12 h-1 border-b-2 border-gray-400 ml-auto mr-auto mt-2 mb-2"></div>

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
        // console.log(window.innerWidth);

        if (window.innerWidth < 640) {
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
  const tempText =
    "Hover over a module, on the right hand side, to learn more about it!";
  const [moduleText1, setModuleText1] = useState(tempText);
  const [moduleText2, setModuleText2] = useState("");
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
  const [customOverlayOffset, setCustomOverlayOffset] = useState(0);
  const [img2Height, setImg2Height] = useState(0);
  const navigate = useNavigate();

  const highPassText1 =
    'The highpass filter serves to "roll off" the low end of a signal, allowing only the higher frequencies to pass through.';
  const highPassText2 =
    "To use the highpass filter, simply select the frequency and resonance values that best suit your needs!";
  const lowPassText1 =
    'The lowpass filter serves to "roll off" the high end of a signal, allowing only the lower frequencies to pass through.';
  const lowPassText2 =
    "To use the lowpass filter, simply select the frequency and resonance values that best suit your needs!";
  const peakText1 =
    'The peak filter adds a standard "peak" to the audio spectrum of the signal, allowing one to shape the frequency spectrum of a signal with a high level of detail.';
  const peakText2 =
    "To use the peak filter, use the frequency, width, and gain sliders to find the perfect filter!";
  const reverbText1 =
    "The reverb module allows one to utilize ProdLodge's convolution reverb in order to shape the space of a sound.";
  const reverbText2 =
    "To use the reverb module, simply select one of the hand crafted impulse responses, created specifically for ProdLodge!";
  const waveshaperText1 =
    "The waveshaper allows for some good old fashioned distortion, giving you the extra crunch you need.";
  const waveshaperText2 =
    'To use the waveshaper module, control the "amount" slider to add the amount of distortion that\'s right for you!';
  const gainText1 =
    "The gain module allows one to, very simply, control the volume level (gain) of the audio.";
  const gainText2 =
    'To use the gain module, move the "amount" slider until you\'re satisfied with the volume!';
  const compressorText1 =
    "The compressor module allows you to have fine-grained control over the dynamics of the audio.";
  const compressorText2 =
    "To use the compressor, tweak the threshold, knee, ratio, etc, until you find the sweet spot that works for you!";

  useEffect(() => {
    if (!img1 || !img1.current) {
      return;
    }

    // console.log(img1.current.height);

    setOverlayOffset(img1.current.height / 100);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((e) => {
      for (const entry of e) {
        // console.log(entry.devicePixelContentBoxSize[0].inlineSize);
        // console.log(entry.contentRect.height);
        if (entry.target.tagName == "DIV") {
          if (window.innerWidth < 640) {
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
        } else if (entry.target.tagName == "IMG") {
          // console.log(entry.contentRect.height);
          setCustomOverlayOffset(entry.contentRect.height / 2);
        } else {
          console.error("Resize oversrver error!");
        }
      }
    });

    if (mainDivRef && mainDivRef.current) {
      observer.observe(mainDivRef.current);
    }

    if (img2 && img2.current) {
      observer.observe(img2.current);
    }

    return () => {
      if (mainDivRef && mainDivRef.current) {
        observer.unobserve(mainDivRef.current);
      }
      if (img2 && img2.current) {
        observer.unobserve(img2.current);
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
          How to get started
        </h1>
        <img
          className="absolute z-10"
          style={imageStyle}
          ref={img1}
          src={started}
        />
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
        className="hover:shadow-xl w-full sm:w-6/12 h-6/6 mr-auto flex flex-row overflow-hidden"
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
            // marginTop: overlayOffset + 238,
            marginTop: customOverlayOffset - 15,
            transition: "all .1s",
          }}
          ref={text2Ref}
          data-scroll
          data-scroll-speed="1.3"
        >
          Modules
        </h1>
        <img
          className="w-full absolute z-10"
          style={imageStyle}
          ref={img2}
          src={modules}
        />
        <div
          className="w-4/6 mr-auto flex flex-col"
          style={{ minHeight: "1%" }}
        >
          <div className="w-full h-max ml-auto mr-auto mt-auto mb-auto">
            <h1 className="w-full h-max ml-auto mr-aut0 text-xl p-3 font-light text-center">
              {moduleText1}
              <br></br>
              <br></br>
              {moduleText2}
            </h1>
          </div>
        </div>
        <div className="w-2/6 h-full ml-auto flex flex-col justify-around">
          <h1 className="w-max ml-auto mr-auto text-3xl font-light mt-2 border-b border-black">
            Modules
          </h1>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(highPassText1);
              setModuleText2(highPassText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              HighPass
            </h2>
          </div>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(lowPassText1);
              setModuleText2(lowPassText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              LowPass
            </h2>
          </div>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(peakText1);
              setModuleText2(peakText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              Peak
            </h2>
          </div>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(reverbText1);
              setModuleText2(reverbText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              Reverb
            </h2>
          </div>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(waveshaperText1);
              setModuleText2(waveshaperText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              Waveshaper
            </h2>
          </div>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(gainText1);
              setModuleText2(gainText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              Gain
            </h2>
          </div>
          <div
            className="shadow-md w-full h-12 mb-2 hover:text-white flex"
            style={{ transition: "all 0.2s" }}
            onMouseEnter={() => {
              setModuleText1(compressorText1);
              setModuleText2(compressorText2);
            }}
            onMouseLeave={() => {
              setModuleText1(tempText);
              setModuleText2("");
            }}
          >
            <h2 className="w-max h-max font-light text-lg sm:text-lg md:text-2xl ml-auto mr-auto mt-auto mb-auto">
              Compressor
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section3 = (): JSX.Element => {
  const creatorText =
    "One of the main things I learned, from my years in the music production community, is the importance of feedback. Being able to have others provide meaningful feedback is one of the main ways that people improve and grow.";
  const creatorText2 =
    "I created ProdLodge as a way to, give back to the music production community, and develop my web development skills. ProdLodge's unique audio module system makes it unlike any other service I've seen or used.";
  const creatorText3 =
    "I plan on supporting ProdLodge indefinitely, adding features and expanding it's capabilities for all future users!";

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
      className="hover:shadow-xl w-11/12 ml-auto mr-auto flex flex-col"
      style={{ minHeight: "70vh", maxHeight: "140vh", transition: "all 0.8s" }}
      ref={mainDivRef}
    >
      <div className="w-full h-1/6 mb-auto flex pt-2">
        <h1 className="w-max ml-auto mr-auto mt-auto mb-auto font-light">
          Message From the Creator
        </h1>
      </div>
      <div className="w-11/12 h-max mb-auto ml-auto mr-auto flex flex-col md:flex-row">
        <img
          className="rounded-full shadow-2xl w-2/6 h-1/2 mt-8 md:mt-auto mb-auto ml-auto md:ml-auto mr-auto object-cover"
          src={aman}
          data-scroll
          data-scroll-speed="1.5"
        />
        <h1 className="h-max mt-auto mb-auto font-light text-xl pl-10 pt-5 pb-5 ">
          {creatorText}
          <br></br>
          <br></br>
          {creatorText2}
          <br></br>
          <br></br>
          {creatorText3}
          <br></br>
          <br></br>
          <strong> - Aman Koua</strong>
        </h1>
      </div>
    </div>
  );
};

export default Landing;
