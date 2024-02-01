import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/old/utils/commonFunctions';
import { useAuth } from 'react-oidc-context';
import {
  Card,
  CardBody,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  PageSection,
  Title,
  CardHeader,
} from '@patternfly/react-core';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import YAML from 'yaml';
import * as d3 from "d3";

const Experimental: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();

  function getDevices() {
    // set svg "chart" empty
    
    if (auth.user?.access_token) {
      fetchData("devices", auth.user?.access_token).then((datad) => {
        console.log("hola");
        /*
        data = {"apiVersion":"v1alpha1","items":[{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:50:53Z","name":"8fef85736b9b2462e8f4f258030544429305ab0fd7ae5591f3afe467e3ff081f"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:05Z","name":"686d7f89b3767d121fb2b1c5c6c2fbd9da86aefd70591cbed3e00af98f4391cd"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:07Z","name":"87f0bfee4d9be24d3f5b9e004c49ad58a6ba06e647e86748092134fcfec67d76"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:14Z","name":"700925fb021b534018cd8749b2656cae7eba6d87aa6dda1cec093a055a38e16c"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:22Z","name":"c18d0582c13f3890f5b2de6733feede3665e8f7570539a74a63b784b91e9483f"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:26Z","name":"5571d36e302d014c8cef703f2d070a529efe6d06c98633b0779794b7a1e7b7de"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:42Z","name":"0e7c323d0390a68450d456f6df9aa83fc2ed70ba3d0083ed9d9238d03769ed47"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:43Z","name":"c03f5b14be069e3268bec6355b78aa63831f3ccda806624f24558ea0ba87de9e"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:44Z","name":"2e2086871c0352bb3d99edb9968ae4c2342bc2405d67c16e5fd0fba4d8a33a28"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}},{"apiVersion":"v1alpha1","kind":"Device","metadata":{"creationTimestamp":"2023-12-10T22:51:44Z","name":"3c5bb8b9d6f0281e036e41216c1fc7e4039ad2cd1abafb35fe196f186a75918c"},"spec":{},"status":{"systemInfo":{"architecture":"amd64","bootID":"c7dd6c0d-5d98-49c1-8b56-ce8d09880c81","machineID":"5ef22615044c4074b15af426073394b8","operatingSystem":"linux"}}}],"kind":"DeviceList","metadata":{}};
    
        */
        let devices = datad.items;
        // deja devices con 10 de muestra
        devices = devices.slice(0, 100);
        const fleets = [
          "solarpannels",
          "batteries",
          "engines",
          "amplifiers",
          "sensors"
        ]

        const regions = [
          "eu-west-1",
          "us-west-1",
          "us-west-2"
        ]

        /*
        actualiza devices con los datos de los devices y una fleet y region random en datos válidos para el gráfico d3
        */
        devices.forEach((device: any) => {
          device.fleet = fleets[Math.floor(Math.random() * fleets.length)];
          if (Math.random() < 0.96) {
            device.color = "green";
          } else {
            device.color = "red";
          }
          device.region = regions[Math.floor(Math.random() * regions.length)];
          // convert device to YAML
          device.yaml = YAML.stringify(device);
        });
        // ahora conviertelo en un dataset válido para s3 que tenga en cuenta solo el device.fleet, device.region y device.metadata.name y un value de 1
        const data: any = {
          name: "devices",
          children: fleets.map((fleet: any) => {
            return {
              name: fleet,
              children: regions.map((region: any) => {
                return {
                  name: region,
                  children: devices.filter((device: any) => device.fleet === fleet && device.region === region).map((device: any) => {
                    return {
                      name: device.metadata.name,
                      value: 1,
                      color: device.color,
                      yaml: device.yaml
                    }
                  })
                }
              })
            }
          })
        };
        // una vez construido el dataset, dame el código para generar una chart de d3 de tipo Zoomable icicle, el ultimo nivel de device quiero que sea agregado a un solo objeto, menos cuando el objeto seleccionado sea la region
        // https://observablehq.com/@d3/zoomable-icicle
          // Specify the chart’s dimensions.
          //set width and height with current window size
          d3.select("#chart").selectAll("*").remove();
          const width = window.innerWidth - 100;
          const height = window.innerHeight - 100;
          // Create the color just with red or green
          const green = d3.color("green");
          const red = d3.color("red");
          const color = d3.scaleOrdinal([green, red]);
          // Compute the layout.
          const hierarchy = d3.hierarchy(data)
              .sum(d => d.value)
              .sort((a, b) => b.height - a.height || b.value - a.value);
          const root = d3.partition()
              .size([height, (hierarchy.height + 1) * width / 3])
            (hierarchy);
        
          // Create the SVG container.
          const svg = d3.select("#chart")
              .attr("viewBox", [0, 0, width, height])
              .attr("width", width)
              .attr("height", height)
              .attr("style", "max-width: 100%; height: auto; font: 16px;");
        
          // Append cells.
          const cell = svg
            .selectAll("g")
            .data(root.descendants())
            .join("g")
              .attr("transform", d => `translate(${d.y0},${d.x0})`);
        
          const rect = cell.append("rect")
              .attr("width", d => d.y1 - d.y0 - 1)
              .attr("height", d => rectHeight(d))
              .attr("fill-opacity", 0.6)
              .attr("fill", d => {
                if (!d.depth) return "#ccc";
                // si d.depth == 3, con una probabilidad del 0.8, el color es verde, sino rojo
                if (d.depth === 4) {
                  return "gray";
                } else if (d.depth === 3) {
                  return d.data.color;
                } else if (d.depth === 2) {
                  // revisar el color de los hijos, si todos son verdes, el color es verde, sino rojo
                  const children = d.children;
                  let allGreen = true;
                  children.forEach((child: any) => {
                    if (child.data.color === "red") {
                      allGreen = false;
                    }
                  });
                  if (allGreen) {
                    return green;
                  } else {
                    return red;
                  }
                } else {
                  const children = d.children;
                  let allGreen = true;
                  children.forEach((child2: any) => {
                    child2.children.forEach((child: any) => {
                      if (child.data.color === "red") {
                        allGreen = false;
                      }
                    }
                    );
                  });
                  if (allGreen) {
                    return green;
                  } else {
                    return red;
                  }
                }
              })
              .style("cursor", "pointer")
              .on("click", clicked);
        
          const text = cell.append("text")
            .style("user-select", "none")
            .attr("pointer-events", "none")
            .attr("x", 10)
            .attr("y", 23)
            .attr("fill-opacity", d => +labelVisible(d));
          text.text((d: any) => {
            return d.data.name;
          }
          );


          const format = d3.format(",d");
          const tspan = text.append("tspan")
              .attr("fill-opacity", d => +labelVisible(d) * 0.7)
              
              .text(d => {
                if (d.depth < 3) {
                  return ` ${format(d.value)}`;
                } else {
                  return "";
                }
              });

          cell.append("title")
              // if !d.data.yaml then show the name, else show the yaml
.text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);


              // On click, change the focus and transitions it into view.
          let focus = root;
          function clicked(event, p) {
            if (p.depth === 0) {
              return;
            }
            if (p.depth === 3 && document.getElementById("float")?.style.display === "none" ) {
              const float = document.getElementById("float");

              // definir el contenido del float con el yaml respetando los saltos de linea y la indentación que tiene ya el yaml
              // usando replaceAll("\n", "<br>") y replaceAll("  ", "&nbsp;&nbsp;") para respetar los saltos de linea y la indentación
              float!.innerHTML = p.data.yaml.replaceAll("\n", "<br>").replaceAll("  ", "&nbsp;&nbsp;&nbsp;&nbsp;");
              // definir un tamaño máximo para el float, y si el yaml es más grande, hacer scroll en el float
              float!.style.maxHeight = "800px";
              float!.style.overflow = "auto";


              
              setTimeout(() => {
                float!.style.display = "block";
              }, 700);
            } else {
              const float = document.getElementById("float");
              float!.style.display = "none";
            }

            focus = focus === p ? p = p.parent : p;
        
            root.each(d => d.target = {
              x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
              x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
              y0: d.y0 - p.y0,
              y1: d.y1 - p.y0
            });
        
            const t = cell.transition().duration(750)
                .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);
        
            rect.transition(t).attr("height", d => rectHeight(d.target));
            text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
            tspan.transition(t).attr("fill-opacity", d => +labelVisible(d.target) * 0.7);
          }
          
          function rectHeight(d) {
            return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
          }
        
          function labelVisible(d) {
            return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
          }
          
          
      });
    }
  }

  getDevices();



  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Experimental</Title>
      <svg id="chart" width="100%" height="900"></svg>
      <div id="float" style={{position: 'absolute', top: 100, right: 100, padding: "3px", width: "900px", background: "#eeeeee",display: "none"}}></div>
    </PageSection>
  )
};

export { Experimental };

