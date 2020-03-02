import React, {Component} from 'react';
import styled from '@emotion/styled';
import {css, keyframes} from '@emotion/core';
import {Location} from '@reach/router';
import TippyLogo from '../images/logo.svg';
import {MEDIA, Container, Flex, ExternalLink} from './Framework';
import GitHub from 'react-feather/dist/icons/github';
import Menu from 'react-feather/dist/icons/menu';
import TextGradient from './TextGradient';
import {version} from '../../../package.json';
import {Link} from 'gatsby';
import {getVersionFromPath, CURRENT_MAJOR} from '../utils';

// Firefox needs `rotate()` for it to be smooth...
const hover = keyframes`
  from {
    transform: translate3d(0, 4px, 0) rotate(0);
  }

  to {
    transform: translate3d(0, 10px, 0) rotate(0.01deg);
  }
`;

const HeaderRoot = styled.header`
  position: relative;
  background-image: radial-gradient(
    circle at 0% 20%,
    #a09eff,
    #4884f0,
    #b3e0fa
  );
  background-repeat: no-repeat;
  background-size: cover;
  padding: 25px 0;
  text-align: center;
  margin-bottom: 50px;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    display: block;
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyMjcwIDE3MzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxLjQxNDIxOyI+ICAgIDxnIGlkPSJBcnRib2FyZCI+ICAgICAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLC0xNDc3Ljc1LC0xMDI5KSI+ICAgICAgICAgICAgPGcgc3R5bGU9ImZpbHRlcjp1cmwoI19FZmZlY3QxKTsiPiAgICAgICAgICAgICAgICA8Zz4gICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9ImMiIGN4PSIxODAyLjQ5IiBjeT0iMTAzMy41MiIgcj0iNDMwLjIyOCIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMik7Ii8+ICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJjMSIgc2VyaWY6aWQ9ImMiIGN4PSIxODAyLjQ5IiBjeT0iMTAzMy41MiIgcj0iNDMwLjIyOCIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMyk7Ii8+ICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJjMiIgc2VyaWY6aWQ9ImMiIGN4PSIxODAyLjQ5IiBjeT0iMTAzMy41MiIgcj0iNDMwLjIyOCIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsNCk7Ii8+ICAgICAgICAgICAgICAgIDwvZz4gICAgICAgICAgICA8L2c+ICAgICAgICA8L2c+ICAgICAgICA8ZyBpZD0iZyIgdHJhbnNmb3JtPSJtYXRyaXgoMC40Mjg4NSwwLDAsMC40Mjg4NSwyNTAuMjE2LC0yMTQuNDUyKSI+ICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTA0My45OSIgY3k9IjcwMC42IiByPSIxMzMiIHN0eWxlPSJmaWxsOnVybCgjX1JhZGlhbDUpOyIvPiAgICAgICAgPC9nPiAgICAgICAgPGcgaWQ9ImkiIHRyYW5zZm9ybT0ibWF0cml4KDAuMzcwNDM4LDAuOTI4ODU3LC0wLjkyODg1NywwLjM3MDQzOCwxNTg2LjgzLC0xNTI3LjE5KSI+ICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkyOS42OSIgY3k9IjIyMS4zMDYiIHI9IjQ1Ljg5NyIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsNik7Ii8+ICAgICAgICA8L2c+ICAgICAgICA8ZyBpZD0iaTEiIHNlcmlmOmlkPSJpIiB0cmFuc2Zvcm09Im1hdHJpeCgtMC44MjY2MzYsMC41NjI3MzcsLTAuNTYyNzM3LC0wLjgyNjYzNiwzODE1Ljc4LC01NTUuNzY3KSI+ICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkyOS42OSIgY3k9IjIyMS4zMDYiIHI9IjQ1Ljg5NyIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsNyk7Ii8+ICAgICAgICA8L2c+ICAgICAgICA8ZyBpZD0iaiIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMjguMjUyLDUyKSI+ICAgICAgICAgICAgPGNpcmNsZSBjeD0iOTUzLjg2MyIgY3k9IjEzNi42MDYiIHI9IjI0LjU1MyIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsOCk7Ii8+ICAgICAgICA8L2c+ICAgICAgICA8ZyBpZD0iajEiIHNlcmlmOmlkPSJqIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDEyOC4yNTIsNTIpIj4gICAgICAgICAgICA8Y2lyY2xlIGN4PSI5NTMuODYzIiBjeT0iMTM2LjYwNiIgcj0iMjQuNTUzIiBzdHlsZT0iZmlsbDp1cmwoI19SYWRpYWw5KTsiLz4gICAgICAgIDwvZz4gICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMjE3LjI1MiwtMjYuMDc5KSI+ICAgICAgICAgICAgPGcgc3R5bGU9ImZpbHRlcjp1cmwoI19FZmZlY3QxMCk7Ij4gICAgICAgICAgICAgICAgPGc+ICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJtIiBjeD0iMTE2Ni44IiBjeT0iMjY3Ljc0IiByPSI0MC4yNzQiIHN0eWxlPSJmaWxsOnVybCgjX1JhZGlhbDExKTsiLz4gICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Im0xIiBzZXJpZjppZD0ibSIgY3g9IjExNjYuOCIgY3k9IjI2Ny43NCIgcj0iNDAuMjc0IiBzdHlsZT0iZmlsbDp1cmwoI19SYWRpYWwxMik7Ii8+ICAgICAgICAgICAgICAgIDwvZz4gICAgICAgICAgICA8L2c+ICAgICAgICA8L2c+ICAgICAgICA8ZyBpZD0ibyIgdHJhbnNmb3JtPSJtYXRyaXgoMS4wMDc1NSwwLDAsMSw4NTQuNDU0LC03MjIuODExKSI+ICAgICAgICAgICAgPGNpcmNsZSBjeD0iODQ0LjIxMiIgY3k9IjEwMDkuMTUiIHI9IjI0LjM2OSIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMTMpOyIvPiAgICAgICAgPC9nPiAgICAgICAgPGcgaWQ9Im8xIiBzZXJpZjppZD0ibyIgdHJhbnNmb3JtPSJtYXRyaXgoMS4wMDc1NSwwLDAsMSw4NTQuNDU0LC03MjIuODExKSI+ICAgICAgICAgICAgPGNpcmNsZSBjeD0iODQ0LjIxMiIgY3k9IjEwMDkuMTUiIHI9IjI0LjM2OSIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMTQpOyIvPiAgICAgICAgPC9nPiAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMjguMjUyLDUyKSI+ICAgICAgICAgICAgPGcgc3R5bGU9ImZpbHRlcjp1cmwoI19FZmZlY3QxNSk7Ij4gICAgICAgICAgICAgICAgPGc+ICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJyIiBjeD0iNDMxLjUxOSIgY3k9IjM0MS41NCIgcj0iNzMuOCIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMTYpOyIvPiAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0icjEiIHNlcmlmOmlkPSJyIiBjeD0iNDMxLjUxOSIgY3k9IjM0MS41NCIgcj0iNzMuOCIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMTcpOyIvPiAgICAgICAgICAgICAgICA8L2c+ICAgICAgICAgICAgPC9nPiAgICAgICAgPC9nPiAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMjguMjUyLDUyKSI+ICAgICAgICAgICAgPGcgc3R5bGU9ImZpbHRlcjp1cmwoI19FZmZlY3QxOCk7Ij4gICAgICAgICAgICAgICAgPGc+ICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJ1IiBjeD0iMTUxNy4xNSIgY3k9IjE4OS42NjEiIHI9IjU5LjY0MiIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMTkpOyIvPiAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0idTEiIHNlcmlmOmlkPSJ1IiBjeD0iMTUxNy4xNSIgY3k9IjE4OS42NjEiIHI9IjU5LjY0MiIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMjApOyIvPiAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0idTIiIHNlcmlmOmlkPSJ1IiBjeD0iMTUxNy4xNSIgY3k9IjE4OS42NjEiIHI9IjU5LjY0MiIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMjEpOyIvPiAgICAgICAgICAgICAgICA8L2c+ICAgICAgICAgICAgPC9nPiAgICAgICAgPC9nPiAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC40Mjg4NSwwLDAsMC40Mjg4NSwzODYuODg3LDgxLjM0NTIpIj4gICAgICAgICAgICA8Y2lyY2xlIGlkPSJ3IiBjeD0iMTEzNC44OCIgY3k9IjYyNS43MjIiIHI9IjQyLjEwMyIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMjIpOyIvPiAgICAgICAgICAgIDxjaXJjbGUgaWQ9IncxIiBzZXJpZjppZD0idyIgY3g9IjExMzQuODgiIGN5PSI2MjUuNzIyIiByPSI0Mi4xMDMiIHN0eWxlPSJmaWxsOnVybCgjX1JhZGlhbDIzKTsiLz4gICAgICAgICAgICA8Y2lyY2xlIGlkPSJ3MiIgc2VyaWY6aWQ9InciIGN4PSIxMTM0Ljg4IiBjeT0iNjI1LjcyMiIgcj0iNDIuMTAzIiBzdHlsZT0iZmlsbDp1cmwoI19SYWRpYWwyNCk7Ii8+ICAgICAgICA8L2c+ICAgICAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC4xMjQxNDksLTAuMjU4MDI4LDAuMjU4MDI4LC0wLjEyNDE0OSw2MzIuMzg5LDkwMSkiPiAgICAgICAgICAgIDxjaXJjbGUgaWQ9InczIiBzZXJpZjppZD0idyIgY3g9IjExMzQuODgiIGN5PSI2MjUuNzIyIiByPSI0Mi4xMDMiIHN0eWxlPSJmaWxsOnVybCgjX1JhZGlhbDI1KTsiLz4gICAgICAgICAgICA8Y2lyY2xlIGlkPSJ3NCIgc2VyaWY6aWQ9InciIGN4PSIxMTM0Ljg4IiBjeT0iNjI1LjcyMiIgcj0iNDIuMTAzIiBzdHlsZT0iZmlsbDp1cmwoI19SYWRpYWwyNik7Ii8+ICAgICAgICAgICAgPGNpcmNsZSBpZD0idzUiIHNlcmlmOmlkPSJ3IiBjeD0iMTEzNC44OCIgY3k9IjYyNS43MjIiIHI9IjQyLjEwMyIgc3R5bGU9ImZpbGw6dXJsKCNfUmFkaWFsMjcpOyIvPiAgICAgICAgPC9nPiAgICA8L2c+ICAgIDxkZWZzPiAgICAgICAgPGZpbHRlciBpZD0iX0VmZmVjdDEiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMTE5Mi4yNiIgeT0iNDIzLjI4OSIgd2lkdGg9IjEyMjAuNDYiIGhlaWdodD0iMTIyMC40NiIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4gICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMzAiLz4gICAgICAgIDwvZmlsdGVyPiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJfUmFkaWFsMiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg4MDEuOTcxLDAsMCw4MDEuOTcxLDE1ODEuNyw3MzQuNzg0KSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMTMyLDE2NywyNTUpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMTMyLDIzMCwyNTUpO3N0b3Atb3BhY2l0eTowIi8+PC9yYWRpYWxHcmFkaWVudD4gICAgICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iX1JhZGlhbDMiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoNjgzLjM3NCwwLDAsNjgzLjM3NCwxOTcwLjM4LDgyNS4wNjMpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMzIsMTY3LDI1NSk7c3RvcC1vcGFjaXR5OjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMzIsMjMwLDI1NSk7c3RvcC1vcGFjaXR5OjAuMjExNzY1Ii8+PC9yYWRpYWxHcmFkaWVudD4gICAgICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iX1JhZGlhbDQiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoNzk2LjI1NywwLDAsNzk2LjI1NywxOTQ3LjgyLDc1Ny43NTgpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyNTUsMjUzLDIyOSk7c3RvcC1vcGFjaXR5OjAiLz48c3RvcCBvZmZzZXQ9IjAuOTkiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMzIsMjMwLDI1NSk7c3RvcC1vcGFjaXR5OjAuNTQxMTc2Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMTMyLDIzMCwyNTUpO3N0b3Atb3BhY2l0eTowLjU0MTE3NiIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWw1IiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDI1Mi4wNDMsMCwwLDI1Mi4wNDMsOTc1LjczMiw2MDguMjUpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYig0OSw4NywyNTEpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI1MywyMjkpO3N0b3Atb3BhY2l0eToxIi8+PC9yYWRpYWxHcmFkaWVudD4gICAgICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iX1JhZGlhbDYiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoODYuOTc3NiwwLDAsODYuOTc3NiwxOTA2LjEzLDE4OS40MzcpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYig0OSw4NywyNTEpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI1MywyMjkpO3N0b3Atb3BhY2l0eToxIi8+PC9yYWRpYWxHcmFkaWVudD4gICAgICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iX1JhZGlhbDciIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoNzIuOTAyOCwwLDAsNzIuOTAyOCwxOTgwLjgyLDI0Ni4zMTgpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxNDgsMjU1LDE5Myk7c3RvcC1vcGFjaXR5OjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYig2NywyNTUsOTcpO3N0b3Atb3BhY2l0eTowLjIxMTc2NSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWw4IiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDQ2LjUyOTQsMCwwLDQ2LjUyOTQsOTQxLjI2MywxMTkuNTU3KSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoNDksODcsMjUxKTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyNTMsMjI5KTtzdG9wLW9wYWNpdHk6MSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWw5IiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDM5LDAsMCwzOSw5ODEuMjE4LDE0OS45ODYpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxNDgsMjU1LDE5Myk7c3RvcC1vcGFjaXR5OjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYig2NywyNTUsOTcpO3N0b3Atb3BhY2l0eTowLjIxMTc2NSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8ZmlsdGVyIGlkPSJfRWZmZWN0MTAiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMTA5Ni41MyIgeT0iMTk3LjQ2NiIgd2lkdGg9IjE0MC41NDgiIGhlaWdodD0iMTQwLjU0OCIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4gICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iNSIvPiAgICAgICAgPC9maWx0ZXI+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwxMSIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg3Ni4zMjE2LDAsMCw3Ni4zMjE2LDExNDYuMTQsMjM5Ljc3NSkiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDAsNDgsMjU1KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzMiwxNjcsMjU1KTtzdG9wLW9wYWNpdHk6MSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwxMiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg2My45NzEyLDAsMCw2My45NzEyLDEyMTEuNjcsMjg5LjY4OCkiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDE0OCwyNTUsMTkzKTtzdG9wLW9wYWNpdHk6MCIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDY3LDI1NSw5Nyk7c3RvcC1vcGFjaXR5OjAuMjExNzY1Ii8+PC9yYWRpYWxHcmFkaWVudD4gICAgICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iX1JhZGlhbDEzIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDQ2LjE4MDcsMCwwLDQ2LjE4MDcsODMxLjcwNiw5OTIuMjI2KSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoNDksODcsMjUxKTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMC45OSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzMiwxNjcsMjU1KTtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzMiwxNjcsMjU1KTtzdG9wLW9wYWNpdHk6MSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwxNCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgzOC43MDc3LDAsMCwzOC43MDc3LDg3MS4zNjIsMTAyMi40MykiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyNTMsMjI5KTtzdG9wLW9wYWNpdHk6MCIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDk5LDIyNiwxNTMpO3N0b3Atb3BhY2l0eTowLjIxMTc2NSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8ZmlsdGVyIGlkPSJfRWZmZWN0MTUiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMjY1LjU3NCIgeT0iMTc1LjU5NSIgd2lkdGg9IjMzMS44OTEiIGhlaWdodD0iMzMxLjg5MSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4gICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMTUuMzU3NiIvPiAgICAgICAgPC9maWx0ZXI+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwxNiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxMzkuODU1LDAsMCwxMzkuODU1LDM5My42NDYsMjkwLjI5NikiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDQ5LDg3LDI1MSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuOTkiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMzIsMTY3LDI1NSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMzIsMTY3LDI1NSk7c3RvcC1vcGFjaXR5OjEiLz48L3JhZGlhbEdyYWRpZW50PiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJfUmFkaWFsMTciIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMTE3LjIyNCwwLDAsMTE3LjIyNCw1MTMuNzQxLDM4MS43NTgpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyNTUsMjUzLDIyOSk7c3RvcC1vcGFjaXR5OjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYig5OSwyMjYsMTUzKTtzdG9wLW9wYWNpdHk6MC4yMTE3NjUiLz48L3JhZGlhbEdyYWRpZW50PiAgICAgICAgPGZpbHRlciBpZD0iX0VmZmVjdDE4IiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjEzMzcuNSIgeT0iMTAuMDE5IiB3aWR0aD0iMzU5LjI4NCIgaGVpZ2h0PSIzNTkuMjg0IiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0iU291cmNlR3JhcGhpYyIgc3RkRGV2aWF0aW9uPSIyMCIvPiAgICAgICAgPC9maWx0ZXI+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwxOSIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxMTYuNDA3LDAsMCwxMTYuNDA3LDE0ODYuNTQsMTQ4LjI0OCkiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDIyMiwwLDExMSk7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjAuOTkiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyNTIsMjEzLDI1NSk7c3RvcC1vcGFjaXR5OjAuODMxMzczIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjUyLDIxMywyNTUpO3N0b3Atb3BhY2l0eTowLjgzMTM3MyIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyMCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg5NC43MzU0LDAsMCw5NC43MzU0LDE1NDAuNDIsMTYwLjc2MykiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzMiwxNjcsMjU1KTtzdG9wLW9wYWNpdHk6MCIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDEzMiwyMzAsMjU1KTtzdG9wLW9wYWNpdHk6MC4yMTE3NjUiLz48L3JhZGlhbEdyYWRpZW50PiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJfUmFkaWFsMjEiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMTEwLjM4NCwwLDAsMTEwLjM4NCwxNTM3LjI5LDE1MS40MzMpIj48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigyNTUsMjUzLDIyOSk7c3RvcC1vcGFjaXR5OjAiLz48c3RvcCBvZmZzZXQ9IjAuOTkiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxMzIsMjMwLDI1NSk7c3RvcC1vcGFjaXR5OjAuNTQxMTc2Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMTMyLDIzMCwyNTUpO3N0b3Atb3BhY2l0eTowLjU0MTE3NiIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyMiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg4MS40NDE1LDAsMCw4MS40NDE1LDExMTMuMjgsNTk2LjQ4NykiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSw4NywxNzYpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjUyLDIxMywyNTUpO3N0b3Atb3BhY2l0eTowLjgzMTM3MyIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyMyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg2Ni44NzY0LDAsMCw2Ni44NzY0LDExNTEuMzEsNjA1LjMyMikiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyMDgsMTUzKTtzdG9wLW9wYWNpdHk6MCIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyMjYsNDIpO3N0b3Atb3BhY2l0eTowLjIxMTc2NSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyNCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg3Ny4zNTkyLDAsMCw3Ny4zNTkyLDExNDkuMSw1OTguNzM2KSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI0OSwyMTIpO3N0b3Atb3BhY2l0eTowIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI1NCwyMDkpO3N0b3Atb3BhY2l0eTowLjU0MTE3NiIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyNSIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg4MS40NDE1LDAsMCw4MS40NDE1LDExMTMuMjgsNTk2LjQ4NykiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSw4NywxNzYpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjUyLDIxMywyNTUpO3N0b3Atb3BhY2l0eTowLjgzMTM3MyIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyNiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg2Ni44NzY0LDAsMCw2Ni44NzY0LDExNTEuMzEsNjA1LjMyMikiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyMDgsMTUzKTtzdG9wLW9wYWNpdHk6MCIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwyMjYsNDIpO3N0b3Atb3BhY2l0eTowLjIxMTc2NSIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9Il9SYWRpYWwyNyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCg3Ny4zNTkyLDAsMCw3Ny4zNTkyLDExNDkuMSw1OTguNzM2KSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI0OSwyMTIpO3N0b3Atb3BhY2l0eTowIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI1NCwyMDkpO3N0b3Atb3BhY2l0eTowLjU0MTE3NiIvPjwvcmFkaWFsR3JhZGllbnQ+ICAgIDwvZGVmcz48L3N2Zz4=);
    background-size: cover;
    width: 100%;
    height: 100vh;
  }
`;

const Logo = styled.img`
  display: block;
  height: 72px;
  margin: 0 auto 10px;
  animation: ${hover} 2s ease-in-out infinite alternate;
`;

const Title = styled.h1`
  display: inline-block;
  font-size: 56px;
  font-weight: 400;
  margin-top: 0;
  margin-bottom: 25px;
`;

const ButtonLink = styled(ExternalLink)`
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 24px;
  border-radius: 4px;
  transition: all 0.25s;
  color: #ffffff;
  margin: 0 8px 8px;
  font-weight: bold;
  font-size: 18px;
  font-weight: 500;
  will-change: opacity;

  &:hover {
    background: white;
    border-bottom-color: white;
    box-shadow: 0 8px 16px -2px rgba(0, 32, 128, 0.25);
    text-decoration: none;
  }
`;

export const MenuButton = styled.button`
  position: absolute;
  top: -8px;
  left: 15px;
  color: rgb(36, 58, 89);
  font-weight: bold;
  border: none;
  background: none;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 0;

  ${MEDIA.lg} {
    display: none;
  }
`;

const Version = styled.a`
  display: inline-block;
  background: rgb(255, 255, 255, 0.95);
  color: #7761d1;
  font-weight: bold;
  margin: 16px 0;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;

  ${MEDIA.md} {
    margin: 16px 0;
  }
`;

const OldVersionWarning = styled.div`
  position: relative;
  background: #fff5c5;
  color: #333;
  z-index: 2;
  text-align: center;
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
`;

const svgStyles = css`
  margin: -16px 0 -32px;

  ${MEDIA.md} {
    margin: -10% 0 -32px;
    margin-left: -250px;
  }

  @media (min-width: 1700px) {
    margin: -9% 0 -32px;
  }
`;

const iconStyles = {
  verticalAlign: '-7px',
  marginRight: '8px',
};

const githubStyles = {
  ...iconStyles,
  width: '24px',
  height: '24px',
  color: '#333',
};

const menuStyles = {
  width: '40px',
  height: '40px',
};

class Header extends Component {
  render() {
    const {isNavOpen, openNav} = this.props;

    return (
      <>
        <Location>
          {({location}) =>
            getVersionFromPath(location.pathname) !== CURRENT_MAJOR && (
              <OldVersionWarning>
                <Container>
                  <span role="img" aria-label="alert">
                    ❗
                  </span>{' '}
                  You're viewing the previous major version's docs.{' '}
                  <Link to="/">Click here</Link> to view the latest version.
                </Container>
              </OldVersionWarning>
            )
          }
        </Location>

        <HeaderRoot>
          <Container>
            <Logo src={TippyLogo} draggable="false" alt="Tippy Logo" />
            <Title>
              <TextGradient>Tippy.js</TextGradient>
            </Title>
            <Flex justify="center">
              <ButtonLink href="https://github.com/atomiks/tippyjs">
                <GitHub style={githubStyles} />
                View on GitHub
              </ButtonLink>
            </Flex>
            <Version href="https://github.com/atomiks/tippyjs/releases">
              Currently v{version}
            </Version>
            <MenuButton
              aria-label="Menu"
              aria-expanded={isNavOpen ? 'true' : 'false'}
              onClick={openNav}
            >
              <Menu style={menuStyles} />
            </MenuButton>
          </Container>
          <svg
            css={svgStyles}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 240"
            fill="white"
          >
            <g>
              <path d="M1920,144.5l0,95.5l-1920,0l0,-65.5c196,-36 452.146,-15.726 657.5,8.5c229.698,27.098 870,57 1262.5,-38.5Z" />
            </g>
          </svg>
        </HeaderRoot>
      </>
    );
  }
}

export default Header;
