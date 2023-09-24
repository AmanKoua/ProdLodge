import { useState, useEffect } from "react";

import {
  FriendRequestData,
  UserFriend,
  FriendRequestResponse,
} from "../customTypes";

interface FriendsProps {
  error: string;
  message: string;
  addFriendEmail: string;
  friendRequests: Object;
  userFriends: UserFriend[];
  setAddFriendEmail: (val: any) => void;
  addFriend: () => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  resolveFriendRequest: (id: string, isAccepted: boolean) => Promise<void>;
  removeRequestNotification: (id: string) => Promise<void>;
  setTriggerFriendDataFetch: (val: boolean) => void;
}

const FriendsPage = ({
  error,
  message,
  addFriendEmail,
  friendRequests,
  userFriends,
  setAddFriendEmail,
  addFriend,
  removeFriend,
  resolveFriendRequest,
  removeRequestNotification,
  setTriggerFriendDataFetch,
}: FriendsProps) => {
  const [incommingRequests, setIncommingRequests] = useState<
    FriendRequestData[]
  >([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestData[]>(
    []
  );

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
                <span
                  className="material-symbols-outlined hover:font-bold"
                  onClick={() => {
                    resolveFriendRequest(request.id, true);
                  }}
                >
                  check
                </span>
                <span
                  className="material-symbols-outlined hover:font-bold"
                  onClick={() => {
                    resolveFriendRequest(request.id, false);
                  }}
                >
                  close
                </span>
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
    const removeItemClass = "material-symbols-outlined hover:font-bold";
    const pendingItemClass = "material-symbols-outlined opacity-0";

    let temp = (
      <>
        {outgoingRequests.map((request, idx) => (
          <div key={idx}>
            <div
              key={idx}
              className="mt-2 pt-1 pb-1 shadow-md flex justify-around"
            >
              <p className="text-lg w-9/12 h-max mt-auto mb-auto overflow-hidden">
                {request.data.email}
              </p>
              {request.data.status == "pending" && (
                <p className={pendingClass}>{request.data.status}</p>
              )}
              {request.data.status == "accept" && (
                <p className={acceptedClass}>Accepted</p>
              )}
              {request.data.status == "reject" && (
                <p className={rejectedClass}>Rejected</p>
              )}
              {request.data.status == "pending" && (
                <span className={pendingItemClass}>close</span>
              )}
              {request.data.status != "pending" && (
                <span
                  className={removeItemClass}
                  onClick={() => {
                    removeRequestNotification(request.id);
                  }}
                >
                  close
                </span>
              )}

              {/*Add dummy icon so all cards align properly*/}
            </div>
          </div>
        ))}
      </>
    );

    return temp;
  };

  const generateCurrentFriendsCards = (): JSX.Element => {
    let temp = (
      <>
        {userFriends.map((item, idx) => (
          <div key={idx} className="mt-2 shadow-md  flex">
            <a
              href={`/userProfile/${item.id}`}
              className="text-lg w-5/6 mt-auto mb-auto overflow-hidden text-black decoration-transparent"
            >
              {item.userName && `user name : ${item.userName}`}
              {item.email && !item.userName && `email : ${item.email}`}
            </a>
            <div className="w-1/6 h-max mt-auto mb-auto overflow-hidden">
              <div className="flex">
                <span
                  className="ml-auto mr-auto material-symbols-outlined hover:font-bold"
                  onClick={() => {
                    const chosenName = item.userName
                      ? item.userName
                      : item.email;
                    const isConfirmed = confirm(
                      `Are you sure you want to remove ${chosenName} as a friend?`
                    );

                    if (isConfirmed) {
                      removeFriend(item.id);
                    } else {
                      return;
                    }
                  }}
                >
                  close
                </span>
              </div>
            </div>
          </div>
        ))}
      </>
    );

    return temp;
  };

  useEffect(() => {
    const partitionRequests = () => {
      let temp = friendRequests as FriendRequestResponse;
      const requests = temp.payload;

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
  }, [friendRequests]);

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
          <button className="font-bold mt-1 mb-1 btn" onClick={addFriend}>
            Add Friend
          </button>
        </div>
      </div>
      <div className="border-b-2 border-prodSecondary w-12/12 h-max pb-3">
        <div className="w-max h-max ml-auto mr-auto">
          <p className="font-bold text-xl p-2">Friend Requests</p>
        </div>

        <div className="w-max block">
          <p className="font-semibold">Incomming</p>
        </div>
        {incommingRequests.length > 0 && generateIncommingRequestCards()}
        {incommingRequests.length == 0 && (
          <p className="w-max mr-auto">No incomming requests</p>
        )}
        <div className="w-max block">
          <p className="font-semibold mt-3">Outgoing</p>
        </div>
        {outgoingRequests.length > 0 && generateOutgoingRequestCards()}
        {outgoingRequests.length == 0 && (
          <p className="w-max mr-auto">No outgoing requests</p>
        )}
      </div>
      <div className="mb-3 border-b-2 border-prodSecondary w-12/12 h-max pb-3">
        <div className="w-max h-max ml-auto mr-auto">
          <p className="font-bold text-xl p-2">Current Friends</p>
        </div>

        {/*current friends cards */}

        {userFriends.length > 0 && generateCurrentFriendsCards()}
        {userFriends.length == 0 && <p className="w-max mr-auto">No friends</p>}
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default FriendsPage;
