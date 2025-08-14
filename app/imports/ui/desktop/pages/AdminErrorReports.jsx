import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { ErrorReports } from "../../../api/errorReport/ErrorReport";
import { MobileOnly } from "../../layouts/Devices";
import { Spacer } from "../../components";
import BackButton from "../../mobile/components/BackButton";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  Content,
  SearchContainer,
  SearchInput,
  SearchIcon,
  SearchResultsCount,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateText,
  ErrorReportsGrid,
  ErrorReportCard,
  ErrorReportHeader,
  ErrorReportInfo,
  ErrorReportTitle,
  ErrorReportId,
  ActionButtons,
  ActionButton,
  ViewButton,
  ErrorReportDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  BadgeContainer,
  SeverityBadge,
  CategoryBadge,
  ResolvedBadge,
  FiltersContainer,
  FilterButton,
  StatsContainer,
  StatCard,
  StatNumber,
  StatLabel,
} from "../styles/AdminErrorReports";

/**
 * Desktop AdminErrorReports component for managing error reports
 */
class DesktopAdminErrorReports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      filterBy: "all", // all, unresolved, critical, recent
      sortBy: "timestamp", // timestamp, severity, category
      sortOrder: "desc", // asc, desc
      page: 0,
      pageSize: 20,
      stackingEnabled: false, // toggle for stacking functionality
      stackingType: "message", // message, route, user
    };
  }

  componentDidMount() {
    // Subscribe to a larger set of error reports for client-side filtering
    this.errorReportsHandle = Meteor.subscribe("errorReports", 200, 0);
    this.statsHandle = Meteor.subscribe("errorReports.count");
  }

  componentWillUnmount() {
    if (this.errorReportsHandle) {
      this.errorReportsHandle.stop();
    }
    if (this.statsHandle) {
      this.statsHandle.stop();
    }
  }

  handleSearch = (e) => {
    this.setState({ searchQuery: e.target.value, page: 0 });
  };

  handleFilterChange = (filter) => {
    this.setState({ filterBy: filter, page: 0 });
  };

  handleStackingToggle = () => {
    this.setState({ stackingEnabled: !this.state.stackingEnabled });
  };

  handleStackingTypeChange = (type) => {
    this.setState({ stackingType: type });
  };

  handleView = (errorReport) => {
    this.props.history.push(`/admin/error-report/${errorReport._id}`);
  };

  handleExpandStack = (stackedErrorReport) => {
    // Temporarily disable stacking to show individual reports
    this.setState({
      stackingEnabled: false,
      // Set search to filter for this specific stack
      searchQuery: stackedErrorReport.stackKey
    });
  };

  handleViewLatest = (stackedErrorReport) => {
    // Find the most recent error report in the stack
    const latestReport = stackedErrorReport.stackedReports.reduce((latest, report) =>
      new Date(report.timestamp) > new Date(latest.timestamp) ? report : latest
    );
    this.props.history.push(`/admin/error-report/${latestReport._id}`);
  };

  handleResolveAll = (stackedErrorReport) => {
    const unresolvedReports = stackedErrorReport.stackedReports.filter(report => !report.resolved);

    if (unresolvedReports.length === 0) {
      swal("Info", "All reports in this stack are already resolved.", "info");
      return;
    }

    swal({
      title: "Resolve All Reports?",
      text: `This will mark all ${unresolvedReports.length} unresolved report${unresolvedReports.length !== 1 ? "s" : ""} in this stack as resolved.`,
      icon: "info",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: `Resolve ${unresolvedReports.length} Report${unresolvedReports.length !== 1 ? "s" : ""}`,
          className: "swal-button--confirm",
        },
      },
    }).then((willResolve) => {
      if (willResolve) {
        let completedCount = 0;
        let errorCount = 0;

        unresolvedReports.forEach((report) => {
          Meteor.call("errorReports.update", report._id, { resolved: true }, (error) => {
            if (error) {
              errorCount++;
            } else {
              completedCount++;
            }

            // Check if all calls completed
            if (completedCount + errorCount === unresolvedReports.length) {
              if (errorCount > 0) {
                swal("Partial Success", `${completedCount} report${completedCount !== 1 ? "s" : ""} resolved successfully. ${errorCount} failed.`, "warning");
              } else {
                swal("Success", `All ${completedCount} report${completedCount !== 1 ? "s" : ""} in the stack marked as resolved!`, "success");
              }
            }
          });
        });
      }
    });
  };

  handleDeleteAll = (stackedErrorReport) => {
    swal({
      title: "Delete All Reports?",
      text: `This action cannot be undone. All ${stackedErrorReport.stackCount} report${stackedErrorReport.stackCount !== 1 ? "s" : ""} in this stack will be permanently deleted.`,
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: `Delete ${stackedErrorReport.stackCount} Report${stackedErrorReport.stackCount !== 1 ? "s" : ""}`,
          className: "swal-button--danger",
        },
      },
    }).then((willDelete) => {
      if (willDelete) {
        let completedCount = 0;
        let errorCount = 0;

        stackedErrorReport.stackedReports.forEach((report) => {
          Meteor.call("errorReports.remove", report._id, (error) => {
            if (error) {
              errorCount++;
            } else {
              completedCount++;
            }

            // Check if all calls completed
            if (completedCount + errorCount === stackedErrorReport.stackCount) {
              if (errorCount > 0) {
                swal("Partial Success", `${completedCount} report${completedCount !== 1 ? "s" : ""} deleted successfully. ${errorCount} failed.`, "warning");
              } else {
                swal("Success", `All ${completedCount} report${completedCount !== 1 ? "s" : ""} in the stack deleted!`, "success");
              }
            }
          });
        });
      }
    });
  };

  handleResolve = (errorReportId) => {
    swal({
      title: "Mark as Resolved?",
      text: "This will mark the error report as resolved.",
      icon: "info",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Mark Resolved",
          className: "swal-button--confirm",
        },
      },
    }).then((willResolve) => {
      if (willResolve) {
        Meteor.call("errorReports.update", errorReportId, { resolved: true }, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Success", "Error report marked as resolved!", "success");
          }
        });
      }
    });
  };

  handleDelete = (errorReportId) => {
    swal({
      title: "Delete Error Report?",
      text: "This action cannot be undone. The error report will be permanently deleted.",
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Delete",
          className: "swal-button--danger",
        },
      },
    }).then((willDelete) => {
      if (willDelete) {
        Meteor.call("errorReports.remove", errorReportId, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Deleted", "Error report has been deleted!", "success");
          }
        });
      }
    });
  };

  filterErrorReports = (errorReports) => {
    const { searchQuery, sortBy, sortOrder, filterBy, stackingEnabled, stackingType } = this.state;

    let filtered = errorReports;

    // Apply filter by type first
    switch (filterBy) {
      case "unresolved":
        filtered = filtered.filter(report => !report.resolved);
        break;
      case "critical":
        filtered = filtered.filter(report => report.severity === "critical" && !report.resolved);
        break;
      case "recent":
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(report => new Date(report.timestamp) > dayAgo);
        break;
      case "all":
      default:
        // No additional filtering for "all"
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.message?.toLowerCase().includes(query) ||
        report.errorId?.toLowerCase().includes(query) ||
        report.username?.toLowerCase().includes(query) ||
        report.component?.toLowerCase().includes(query) ||
        report.route?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "severity":
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aVal = severityOrder[a.severity] || 0;
          bVal = severityOrder[b.severity] || 0;
          break;
        case "category":
          aVal = a.category || "";
          bVal = b.category || "";
          break;
        case "timestamp":
        default:
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply stacking if enabled
    if (stackingEnabled) {
      return this.stackErrorReports(filtered, stackingType);
    }

    return filtered;
  };

  stackErrorReports = (errorReports, stackingType) => {
    const stacks = {};

    errorReports.forEach(report => {
      let stackKey;

      switch (stackingType) {
        case "message":
          // Group by first 100 characters of error message
          stackKey = report.message?.substring(0, 100) || "Unknown Error";
          break;
        case "route":
          stackKey = report.route || "Unknown Route";
          break;
        case "user":
          stackKey = report.username || "Anonymous";
          break;
        default:
          stackKey = "Unknown";
      }

      if (!stacks[stackKey]) {
        stacks[stackKey] = {
          ...report, // Use first report as representative
          stackKey,
          stackedReports: [],
          stackCount: 0,
          isStack: true,
          latestTimestamp: report.timestamp,
          unresolvedCount: 0,
          criticalCount: 0,
        };
      }

      stacks[stackKey].stackedReports.push(report);
      stacks[stackKey].stackCount++;

      // Update latest timestamp
      if (new Date(report.timestamp) > new Date(stacks[stackKey].latestTimestamp)) {
        stacks[stackKey].latestTimestamp = report.timestamp;
      }

      // Count unresolved and critical
      if (!report.resolved) {
        stacks[stackKey].unresolvedCount++;
      }
      if (report.severity === "critical") {
        stacks[stackKey].criticalCount++;
      }
    });

    return Object.values(stacks).sort((a, b) =>
      new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
    );
  };

  formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "#dc3545";
      case "high": return "#fd7e14";
      case "medium": return "#ffc107";
      case "low": return "#6c757d";
      default: return "#6c757d";
    }
  };

  getCategoryColor = (category) => {
    switch (category) {
      case "javascript": return "#007bff";
      case "component": return "#28a745";
      case "network": return "#6f42c1";
      case "auth": return "#dc3545";
      case "database": return "#20c997";
      default: return "#6c757d";
    }
  };

  render() {
    const { searchQuery, filterBy, stackingEnabled, stackingType } = this.state;
    const { errorReports, ready } = this.props;

    if (!ready) {
      return (
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading error reports...</LoadingText>
          </LoadingContainer>
        </Container>
      );
    }

    const filteredReports = this.filterErrorReports(errorReports);

    return (
      <Container>
        <BackButton />
        <Header>
          <Title>
            <TitleIcon>🚨</TitleIcon>
            Error Reports
          </Title>
        </Header>

        <Content>
          {/* Stats Overview */}
          <StatsContainer>
            <StatCard>
              <StatNumber>{errorReports.length}</StatNumber>
              <StatLabel>Total Reports</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{errorReports.filter(r => !r.resolved).length}</StatNumber>
              <StatLabel>Unresolved</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{errorReports.filter(r => r.severity === 'critical' && !r.resolved).length}</StatNumber>
              <StatLabel>Critical</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{errorReports.filter(r => {
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return new Date(r.timestamp) > dayAgo;
              }).length}</StatNumber>
              <StatLabel>Last 24h</StatLabel>
            </StatCard>
          </StatsContainer>

          {/* Filters */}
          <FiltersContainer>
            <FilterButton
              active={filterBy === "all"}
              onClick={() => this.handleFilterChange("all")}
            >
              All Reports
            </FilterButton>
            <FilterButton
              active={filterBy === "unresolved"}
              onClick={() => this.handleFilterChange("unresolved")}
            >
              Unresolved
            </FilterButton>
            <FilterButton
              active={filterBy === "critical"}
              onClick={() => this.handleFilterChange("critical")}
            >
              Critical
            </FilterButton>
            <FilterButton
              active={filterBy === "recent"}
              onClick={() => this.handleFilterChange("recent")}
            >
              Recent (24h)
            </FilterButton>
          </FiltersContainer>

          {/* Stacking Controls */}
          <FiltersContainer>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={stackingEnabled}
                  onChange={this.handleStackingToggle}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#667eea",
                    cursor: "pointer"
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>
                  Enable Stacking
                </span>
              </label>

              {stackingEnabled && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#666" }}>Stack by:</span>
                  <FilterButton
                    active={stackingType === "message"}
                    onClick={() => this.handleStackingTypeChange("message")}
                  >
                    Error Message
                  </FilterButton>
                  <FilterButton
                    active={stackingType === "route"}
                    onClick={() => this.handleStackingTypeChange("route")}
                  >
                    Route
                  </FilterButton>
                  <FilterButton
                    active={stackingType === "user"}
                    onClick={() => this.handleStackingTypeChange("user")}
                  >
                    User
                  </FilterButton>
                </div>
              )}
            </div>
          </FiltersContainer>

          {/* Search */}
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search by error message, ID, user, component, or route..."
              value={searchQuery}
              onChange={this.handleSearch}
            />
          </SearchContainer>

          <SearchResultsCount>
            {stackingEnabled
              ? `${filteredReports.length} stack${filteredReports.length !== 1 ? "s" : ""} found (${filteredReports.reduce((total, report) => total + (report.stackCount || 1), 0)} total reports)`
              : `${filteredReports.length} error report${filteredReports.length !== 1 ? "s" : ""} found`
            }
          </SearchResultsCount>

          {/* Error Reports Grid */}
          {filteredReports.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>📋</EmptyStateIcon>
              <EmptyStateTitle>No error reports found</EmptyStateTitle>
              <EmptyStateText>
                {searchQuery ? "Try adjusting your search terms" : "No error reports match the current filter"}
              </EmptyStateText>
            </EmptyState>
          ) : (
            <ErrorReportsGrid>
              {filteredReports.map((errorReport) => (
                <ErrorReportCard key={errorReport._id} resolved={errorReport.resolved}>
                  <ErrorReportHeader>
                    <ErrorReportInfo>
                      <ErrorReportTitle>
                        {errorReport.isStack && (
                          <span style={{
                            backgroundColor: "#667eea",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            marginRight: "8px"
                          }}>
                            STACK ({errorReport.stackCount})
                          </span>
                        )}
                        {errorReport.stackKey || errorReport.message?.substring(0, 100)}
                        {(!errorReport.stackKey && errorReport.message?.length > 100) ? "..." : ""}
                      </ErrorReportTitle>
                      <ErrorReportId>
                        {errorReport.isStack
                          ? `Latest ID: ${errorReport.errorId} | ${errorReport.unresolvedCount} unresolved | ${errorReport.criticalCount} critical`
                          : `ID: ${errorReport.errorId}`
                        }
                      </ErrorReportId>
                    </ErrorReportInfo>
                    <ActionButtons>
                      {errorReport.isStack ? (
                        <>
                          <ViewButton onClick={() => this.handleViewLatest(errorReport)}>
                            View Latest
                          </ViewButton>
                          {errorReport.unresolvedCount > 0 && (
                            <ActionButton
                              color="#28a745"
                              onClick={() => this.handleResolveAll(errorReport)}
                            >
                              Resolve All ({errorReport.unresolvedCount})
                            </ActionButton>
                          )}
                          <ActionButton
                            color="#dc3545"
                            onClick={() => this.handleDeleteAll(errorReport)}
                          >
                            Delete All ({errorReport.stackCount})
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ViewButton onClick={() => this.handleView(errorReport)}>
                            View Details
                          </ViewButton>
                          {!errorReport.resolved && (
                            <ActionButton
                              color="#28a745"
                              onClick={() => this.handleResolve(errorReport._id)}
                            >
                              Resolve
                            </ActionButton>
                          )}
                          <ActionButton
                            color="#dc3545"
                            onClick={() => this.handleDelete(errorReport._id)}
                          >
                            Delete
                          </ActionButton>
                        </>
                      )}
                    </ActionButtons>
                  </ErrorReportHeader>

                  <ErrorReportDetails>
                    {errorReport.isStack ? (
                      <>
                        <DetailItem>
                          <DetailLabel>Stack Type:</DetailLabel>
                          <DetailValue>{stackingType === "message" ? "Error Message" : stackingType === "route" ? "Route" : "User"}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Total Reports:</DetailLabel>
                          <DetailValue>{errorReport.stackCount}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Unresolved:</DetailLabel>
                          <DetailValue>{errorReport.unresolvedCount}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Critical:</DetailLabel>
                          <DetailValue>{errorReport.criticalCount}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Latest Time:</DetailLabel>
                          <DetailValue>{this.formatTimestamp(errorReport.latestTimestamp)}</DetailValue>
                        </DetailItem>
                      </>
                    ) : (
                      <>
                        <DetailItem>
                          <DetailLabel>User:</DetailLabel>
                          <DetailValue>{errorReport.username || "Anonymous"}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Component:</DetailLabel>
                          <DetailValue>{errorReport.component || "Unknown"}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Route:</DetailLabel>
                          <DetailValue>{errorReport.route || "Unknown"}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Platform:</DetailLabel>
                          <DetailValue>{errorReport.platform || "Web"}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Time:</DetailLabel>
                          <DetailValue>{this.formatTimestamp(errorReport.timestamp)}</DetailValue>
                        </DetailItem>
                      </>
                    )}
                  </ErrorReportDetails>

                  <BadgeContainer>
                    <SeverityBadge color={this.getSeverityColor(errorReport.severity)}>
                      {errorReport.severity?.toUpperCase()}
                    </SeverityBadge>
                    <CategoryBadge color={this.getCategoryColor(errorReport.category)}>
                      {errorReport.category?.toUpperCase()}
                    </CategoryBadge>
                    {errorReport.resolved && (
                      <ResolvedBadge>RESOLVED</ResolvedBadge>
                    )}
                  </BadgeContainer>
                </ErrorReportCard>
              ))}
            </ErrorReportsGrid>
          )}

          <MobileOnly>
            <Spacer />
          </MobileOnly>
        </Content>
      </Container>
    );
  }
}

DesktopAdminErrorReports.propTypes = {
  errorReports: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("errorReports", 50, 0);
    return {
      errorReports: ErrorReports.find({}, { sort: { timestamp: -1 } }).fetch(),
      ready: subscription.ready(),
    };
  })(DesktopAdminErrorReports),
);
