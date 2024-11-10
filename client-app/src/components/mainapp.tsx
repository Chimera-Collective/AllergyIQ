import UserInput from "./userinput";
import OutputResponse from "./outputresponse";

const MainApp = () => {
    return (
        <div className="w-full max-w-[800px] mx-auto p-4">
          <div className="flex flex-col space-y-8">
            <UserInput />
            {/* <OutputResponse /> */}
          </div>
        </div>
      );
};

export default MainApp;