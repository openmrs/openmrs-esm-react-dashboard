import React, { useEffect, useState } from "react";
import { openmrsFetch, getCurrentUser } from "@openmrs/esm-api";
import { useMediaQuery } from "react-responsive";

import WidgetLoader from "./widget-loader.component";
import LoadingStatus from "./model/loading-status";

export default function Root(props: RootProps) {
  const rootConfigPath = "/frontend/dashboard-configs";
  const [dashboardConfig, setDashboardConfig] = useState(undefined);
  const [configLoadingStatus, setConfigLoadingStatus] = useState(
    LoadingStatus.Loading
  );
  const [loggedInUser, setLoggedInUser] = React.useState(null);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const isLoggedIn = user => user && user.authenticated;
  const getUserProps = user => ({
    id: user.user.uuid,
    locale: user.locale
  });
  useEffect(() => {
    const sub = getCurrentUser({ includeAuthStatus: true }).subscribe(user =>
      setLoggedInUser(user)
    );

    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn(loggedInUser)) {
      return;
    }

    let dashboardType = window.location.pathname.split("/").pop();
    openmrsFetch(`${rootConfigPath}/${dashboardType}.json`)
      .then(response => {
        setDashboardConfig(response.data);
        setConfigLoadingStatus(LoadingStatus.Loaded);
      })
      .catch(error => {
        setConfigLoadingStatus(LoadingStatus.Failed);
      });
  }, [loggedInUser]);

  function renderDashboard() {
    return (
      <>
        {dashboardConfig.contents.map(widget => {
          return (
            <WidgetLoader
              key={widget.library.module}
              config={widget}
              userProps={getUserProps(loggedInUser)}
            ></WidgetLoader>
          );
        })}
      </>
    );
  }

  function renderLoadingMessage() {
    return <span className="loading">Loading...</span>;
  }

  function renderErrorMessage(message) {
    return <span className="error">{message}</span>;
  }

  function displayDashboard() {
    switch (configLoadingStatus) {
      case LoadingStatus.Loaded:
        return renderDashboard();
      case LoadingStatus.Loading:
        return renderLoadingMessage();
      default:
        return renderErrorMessage("Unable to load dashboard");
    }
  }

  function getColumnsLayoutStyle(): string {
    let numberOfColumns = 1;
    if (!isTabletOrMobile) {
      numberOfColumns =
        configLoadingStatus === LoadingStatus.Loaded &&
        dashboardConfig.layout &&
        dashboardConfig.layout.columns
          ? dashboardConfig.layout.columns
          : 2;
    }

    return String("1fr ")
      .repeat(numberOfColumns)
      .trimRight();
  }

  return (
    <div className="content">
      <div
        style={{ gridTemplateColumns: getColumnsLayoutStyle() }}
        className="dashboard"
      >
        {displayDashboard()}
      </div>
    </div>
  );
}

type RootProps = {};
