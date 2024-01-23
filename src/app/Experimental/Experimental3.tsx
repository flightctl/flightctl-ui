import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/utils/commonFunctions';
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
import { DevicesDonuts } from '@app/Overview/devicesDonuts';
const Experimental3: React.FunctionComponent = () => {
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
        devices = devices.slice(0, 1000);
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
          if (Math.random() < 0.997) {
            device.color = "limegreen";
          } else {
            device.color = "tomato";
          }
          device.region = regions[Math.floor(Math.random() * regions.length)];
          // convert device to YAML
          device.yaml = YAML.stringify(device);
        });
        // ahora conviertelo en un dataset válido para s3 que tenga en cuenta solo el device.fleet, device.region y device.metadata.name y un value de 1
        const data: any = {
          name: "devices",
          children: fleets.map((fleet: any) => {
            let feetColor = "limegreen";
            return {
              name: fleet,
              children: regions.map((region: any) => {
                let regionColor = "limegreen";
                return {
                  name: region,
                  children: devices.filter((device: any) => device.fleet === fleet && device.region === region).map((device: any) => {
                    if (device.color !== "limegreen") {
                      feetColor = device.color;
                      regionColor = device.color;
                    }
                    return {
                      // get the first 10 characters of the name
                      name: device.metadata.name.substring(0, 10),
                      value: 1,
                      color: device.color,
                      yaml: device.yaml
                    }
                  }),
                  color: regionColor
                }
              }),
              color: feetColor
            }
          })
        };
        // una vez construido el dataset, dame el código para generar una chart de d3 de tipo Zoomable icicle, el ultimo nivel de device quiero que sea agregado a un solo objeto, menos cuando el objeto seleccionado sea la region
        // https://observablehq.com/@d3/zoomable-icicle
          // Specify the chart’s dimensions.
          //set width and height with current window size



          d3.select("#chart2").selectAll("*").remove();
          const width = 700;
          const height = width;
          const radius = width / 6;
          const green = d3.color("limegreen");
          const red = d3.color("tomato");
          const blue = d3.color("steelblue");
          const color = d3.scaleOrdinal([green, red, blue]);

          const hierarchy = d3.hierarchy(data)
              .sum(d => d.value)
              .sort((a, b) => b.value - a.value);
          const root = d3.partition()
              .size([2 * Math.PI, hierarchy.height + 1])
            (hierarchy);
          root.each(d => d.current = d);
          const arc = d3.arc()
              .startAngle(d => d.x0)
              .endAngle(d => d.x1)
              .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
              .padRadius(radius * 1.5)
              .innerRadius(d => d.y0 * radius)
              .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

          const svg = d3.select("#chart2").append("svg")
              .attr("viewBox", [-width / 2, -height /2, width, width])
              .style("font", "10px sans-serif");

          const path = svg.append("g")
              .selectAll("path")
              .data(root.descendants().slice(1))
              .join("path")
              .attr("fill", d => { 
                return d.data.color;
              })
              .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
              .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
              .attr("d", d => arc(d.current));
          path.filter(d => d.children)
              .style("cursor", "pointer")
              .on("click", clicked);
          
          const format = d3.format(",d");
          path.append("title")
              .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

          const label = svg.append("g")
              .attr("pointer-events", "none")
              .attr("text-anchor", "middle")
              .style("user-select", "none")
              .selectAll("text")
              .data(root.descendants().slice(1))
              .join("text")
              .attr("dy", "0.35em")
              .attr("fill-opacity", d => +labelVisible(d.current))
              .attr("transform", d => labelTransform(d.current))
              .text(d => d.data.name);

          const parent = svg.append("circle")
              .datum(root)
              .attr("r", radius)
              .attr("fill", "none")
              .attr("pointer-events", "all")
              .on("click", clicked);
          
          function clicked(event, p) {
            parent.datum(p.parent || root);

            root.each(d => d.target = {
              x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              y0: Math.max(0, d.y0 - p.depth),
              y1: Math.max(0, d.y1 - p.depth)
            });
            
            const t = svg.transition().duration(750);

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
              .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
              })
              .filter(function(this: SVGElement, d) {
                return +(this.getAttribute("fill-opacity") ?? 0) || arcVisible(d.target);
              })
              .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
              .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
              .attrTween("d", d => () => arc(d.current));
              
              label.filter(function(this: SVGElement, d) {
                return +(this.getAttribute("fill-opacity") ?? 0) || labelVisible(d.target);
              }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
              }
  
              function arcVisible(d) {
                return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
              }
            
              function labelVisible(d) {
                return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
              }
            
              function labelTransform(d) {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2 * radius;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
              }
            
              return svg.node();
            });
            
    }
  }

  getDevices();



  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Experimental</Title>
      <svg id="chart2" width="700" height="700" style={{zIndex: "2", pointerEvents: "all"}}></svg>
      
      <div id="float" style={{position: 'absolute', top: 100, right: 100, padding: "3px", width: "900px", background: "#eeeeee",display: "none"}}></div>
      <div style={{position: "absolute", top: "357px", left: "522px", width: "300px", height:"300px", pointerEvents:"none", zIndex: "1"}} ><DevicesDonuts /></div>
    </PageSection>
  )
};

export { Experimental3 };

