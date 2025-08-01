import Appbar from "../components/Appbar";
import Quiz from "../components/Quiz";

export default function Home() {
  return (
    <div className="w-full relative">
      <div className="flex justify-center">
        <Appbar />
      </div>
      <div className="">
      <Quiz/>
      </div>
    </div>
  );
}
