"use client";

import { useState } from "react";

import { fabrics } from "../pageData";
import FabricCard from "./FabricCard";

export default function FabricGrid() {
  const [selected, setSelected] = useState(1);

  return (
    <>

      <h2 className="mb-10 text-4xl font-semibold">
        Fabric Style
      </h2>

      <div className="grid grid-cols-3 gap-8">

        {fabrics.map((fabric) => (
          <FabricCard
            key={fabric.id}
            title={fabric.name}
            image={fabric.image}
            price={fabric.price}
            selected={selected === fabric.id}
            onClick={() => setSelected(fabric.id)}
          />
        ))}

      </div>

    </>
  );
}