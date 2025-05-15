import { Stage, Container, Graphics } from "@pixi/react";

function App() {
  return (
    <Stage width={800} height={600} options={{ backgroundColor: 0xffffff }}>
      <Container>
        <Graphics
          draw={(g) => {
            g.beginFill(0x000000);
            g.drawCircle(400, 300, 50);
            g.endFill();
          }}
        />
      </Container>
    </Stage>
  );
}

export default App;
