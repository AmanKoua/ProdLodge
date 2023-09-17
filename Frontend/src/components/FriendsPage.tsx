import { useState, useEffect } from "react";

interface FriendsProps {
  error: string;
  message: string;
  addFriendEmail: string;
  friendRequests: Object[];
  setAddFriendEmail: (val: any) => void;
  setTriggerFriendRequestsFetch: (val: boolean) => void;
}

const FriendsPage = ({
  error,
  message,
  addFriendEmail,
  friendRequests,
  setAddFriendEmail,
  setTriggerFriendRequestsFetch,
}: FriendsProps) => {
  const [incommingRequests, setIncommingRequests] = useState<Object[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Object[]>([]);

  const generateIncommingRequestCards = (): JSX.Element => {
    let temp = (
      <>
        {incommingRequests.map((request, idx) => (
          <>
            <div className="mt-2 shadow-md flex">
              <p className="text-lg w-5/6 overflow-hidden">
                {`Email: ${request.data.email}`}
              </p>
              <div className="w-1/6 h-full overflow-hidden flex justify-around">
                <span className="material-symbols-outlined">check</span>
                <span className="material-symbols-outlined">close</span>
              </div>
            </div>
          </>
        ))}
      </>
    );

    return temp;
  };

  const generateOutgoingRequestCards = (): JSX.Element => {
    const pendingClass = "bg-yellow-300 rounded-lg text-center mt-auto mb-auto";
    const acceptedClass = "bg-green-300 rounded-lg text-center mt-auto mb-auto";
    const rejectedClass = "bg-red-300 rounded-lg text-center mt-auto mb-auto";

    let temp = (
      <>
        {outgoingRequests.map((request, idx) => (
          <>
            <div className="mt-2 pt-1 pb-1 shadow-md flex justify-around">
              <p className="text-lg w-9/12 h-max mt-auto mb-auto overflow-hidden">
                {request.data.email}
              </p>
              {request.data.status == "pending" && (
                <p className={pendingClass}>{request.data.status}</p>
              )}
              {request.data.status == "accepted" && (
                <p className={acceptedClass}>{request.data.status}</p>
              )}
              {request.data.status == "rejected" && (
                <p className={rejectedClass}>{request.data.status}</p>
              )}
              <span className="material-symbols-outlined opacity-0">close</span>{" "}
              {/*Add dummy icon so all cards align properly*/}
            </div>
          </>
        ))}
      </>
    );

    return temp;
  };

  useEffect(() => {
    const partitionRequests = () => {
      const requests = friendRequests.payload;

      if (!requests) {
        return;
      }

      let incomming = requests.filter(
        (request) => request.type == "incommingFriendRequest"
      );
      let outgoing = requests.filter(
        (request) => request.type == "outgoingFriendRequest"
      );

      setIncommingRequests(incomming);
      setOutgoingRequests(outgoing);
    };

    partitionRequests();
  }, []);

  return (
    <div className="w-12/12 h-screen mt-2">
      <div className="border-b-2 border-prodSecondary w-12/12 h-max">
        <input
          type="email"
          value={addFriendEmail}
          placeholder="Friend's email"
          className="w-full mr-auto ml-auto p-2"
          onChange={(e) => {
            setAddFriendEmail(e.target.value);
          }}
        ></input>
        <div className="w-max mr-auto ml-auto p-2 ">
          <button className="font-bold mt-1 mb-1 btn">Add Friend</button>
        </div>
      </div>
      <div className="border-b-2 border-prodSecondary w-12/12 h-max pb-3">
        <div className="w-max h-max ml-auto mr-auto">
          <p className="font-bold text-xl p-2">Friend Requests</p>
        </div>

        <div className="w-max block">
          <p className="font-semibold">Incomming</p>
        </div>

        {/* Display card with friend requests */}

        {/* <div className="mt-2 shadow-md  flex">
          <p className=" text-lg w-5/6 overflow-hidden p-2">
            Email : thegnomezone@gmail.com
          </p>
          <div className="w-1/6 h-full mt-auto mb-auto overflow-hidden flex justify-around">
            <span className="material-symbols-outlined">check</span>
            <span className="material-symbols-outlined">close</span>
          </div>
        </div> */}

        {generateIncommingRequestCards()}

        {/* End sample friends cards */}

        <div className="w-max block">
          <p className="font-semibold mt-3">Outgoing</p>
        </div>

        {/* Sample outgoing cards */}

        {/* <div className="mt-2 pt-1 pb-1 shadow-md flex justify-around">
          <p className="text-lg w-9/12 h-max mt-auto mb-auto overflow-hidden">
            Email : thegnomezone@gmail.com
          </p>
          <p className="bg-yellow-300 rounded-lg text-center mt-auto mb-auto">
            Pending
          </p>
          <span className="material-symbols-outlined opacity-0">close</span>{" "}
        </div> */}

        {generateOutgoingRequestCards()}

        {/* End sample outgoing cards */}
      </div>
      <div className="mb-3 border-b-2 border-prodSecondary w-12/12 h-max pb-3">
        <div className="w-max h-max ml-auto mr-auto">
          <p className="font-bold text-xl p-2">Current Friends</p>
        </div>

        {/* Sample current friends cards */}

        <div className="mt-2 shadow-md  flex">
          <p className="text-lg w-5/6 mt-auto mb-auto overflow-hidden">
            Email : thegnomezone@gmail.com
          </p>
          <div className="w-1/6 h-max mt-auto mb-auto overflow-hidden">
            <div className="flex">
              <span className="ml-auto mr-auto material-symbols-outlined">
                close
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 shadow-md  flex">
          <p className="text-lg w-5/6 mt-auto mb-auto overflow-hidden">
            Email : thegnomezone@gmail.com
          </p>
          <div className="w-1/6 h-max mt-auto mb-auto overflow-hidden">
            <div className="flex">
              <span className="ml-auto mr-auto material-symbols-outlined">
                close
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 shadow-md  flex">
          <p className="text-lg w-5/6 mt-auto mb-auto overflow-hidden">
            Email : thegnomezone@gmail.com
          </p>
          <div className="w-1/6 h-max mt-auto mb-auto overflow-hidden">
            <div className="flex">
              <span className="ml-auto mr-auto material-symbols-outlined">
                close
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default FriendsPage;
