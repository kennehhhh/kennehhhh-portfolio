import Header from "./components/ui/Header.jsx";
import { Button } from "./components/ui/button.tsx";
import { Particles } from "./components/magicui/particles.tsx";
import kennehPic from "./assets/kenneh_profile_pic.jpg";

function App() {
  return (
    <>
      <Header />
      <main>
        <section className="titleSection">
          <img
            src={kennehPic}
            style={{
              border: "8px round white",
              borderRadius: "12px",
              width: "120px",
              maxWidth: "100%",
              height: "auto",
            }}
          />
          <h3>Hello! My name is</h3>
          <br></br>
          <h1>
            <span>K</span>
            <span>e</span>
            <span>n</span>
            <span>n</span>
            <span>y</span>
          </h1>
          <div style={{ fontSize: "24px" }}>
            Video Editor • Graphic Designer • Developer
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
