import React from "react";

const About = () => {
  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-max mr-auto ml-auto pb-4 hide-scrollbar overflow-y-scroll hide-scrollbar">
      <div className="w-8/12 h-full mr-auto ml-auto pb-2 pt-2 flex-col">
        <h1 className="w-max ml-auto mr-auto p-2 border-b border-black">
          About
        </h1>
        <div className="w-10/12 h-max ml-auto mr-auto ">
          <h5 className="w-max p-2">What is ProdLodge</h5>
          <p className=" bg-prodSecondary ml-auto mr-auto p-2 shadow-md">
            ProdLodge is an online music production feedback forum, harnessing
            audio engineering tools built directly into the web browser. It
            abstracts the underlying complexity of the web audio API into
            easy-to-use modules for music-producers, audio engineers, and sound
            designers to use when sharing their ideas.
          </p>
        </div>
        <div className="w-10/12 h-max ml-auto mr-auto ">
          <h5 className="w-max p-2">Who created ProdLodge?</h5>
          <p className=" bg-prodSecondary ml-auto mr-auto p-2 shadow-md">
            ProdLodge is the personal project of <strong>Aman Koua</strong>, a
            software developer with a passion for programming, and music
            production. ProdLodge serves as a way to fuse these 2 passions
            together, harnessing the knowledge and skills gained while
            developing both skillsets.
          </p>
        </div>
        <div className="w-10/12 h-max ml-auto mr-auto ">
          <h5 className="w-max p-2">Is ProdLodge available to the public?</h5>
          <p className=" bg-prodSecondary ml-auto mr-auto p-2 shadow-md">
            Access is currently limited to a select number of users (due to
            database restrictions and cloud infrastructure / hosting costs). If
            you have been provided the link to this page, you have priviledged
            access to the site.
          </p>
        </div>
        <div className="w-10/12 h-max ml-auto mr-auto ">
          <h5 className="w-max p-2">What features are supported?</h5>
          <p className=" bg-prodSecondary ml-auto mr-auto p-2 shadow-md">
            Users have the ability to view other user's songs, upload their own
            songs, comment on songs, load and create different configurations
            (configurations of audio modules), manage their profile, and add /
            remove friends.
          </p>
        </div>
        <div className="w-10/12 h-max ml-auto mr-auto ">
          <h5 className="w-max p-2">Where can I view the source code?</h5>
          <p className=" bg-prodSecondary ml-auto mr-auto p-2 shadow-md">
            The source code, which is unlicensed, can be viewed with the
            provided link. It should be noted that unauthorized replication,
            use, and distribution of the source code is strictly prohibited.
            <strong> All rights belong to the project's creator!</strong>
            <a href="https://github.com/AmanKoua/ProdLodge">
              {" "}
              https://github.com/AmanKoua/ProdLodge
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
