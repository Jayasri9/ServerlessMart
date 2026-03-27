import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ViewAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    recentOrders: [],
    topProducts: [],
    monthlyData: [],
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageItemsPerOrder: 0,
    loading: true,
    lastUpdated: null,
    error: null
  });

  const fetchTenantData = async (key, url, tenantId) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.filter(item => item.tenantId === tenantId);
      } else {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved).filter(item => item.tenantId === tenantId) : [];
      }
    } catch {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved).filter(item => item.tenantId === tenantId) : [];
    }
  };

  const loadAnalytics = useCallback(async () => {
    try {
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) return navigate("/tenant-login");

      const [tenantOrders, tenantProducts] = await Promise.all([
        fetchTenantData("tenantOrders", "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/orders", tenantId),
        fetchTenantData("tenantProducts", "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/products", tenantId)
      ]);

      const totalRevenue = tenantOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = tenantOrders.length;
      const totalProducts = tenantProducts.length;
      const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

      const recentOrders = tenantOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const productSales = {};
      tenantOrders.forEach(order => {
        order.items?.forEach(item => {
          if (!productSales[item.productId]) productSales[item.productId] = { ...item, sales: 0, revenue: 0 };
          productSales[item.productId].sales += item.quantity || 1;
          productSales[item.productId].revenue += (item.price * item.quantity) || 0;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
        .map(p => ({ ...tenantProducts.find(tp => tp.productId === p.productId), ...p }))
        .filter(p => p.productId);

      const monthlyDataObj = {};
      tenantOrders.forEach(order => {
        const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyDataObj[month]) monthlyDataObj[month] = { revenue: 0, orders: 0 };
        monthlyDataObj[month].revenue += order.totalAmount || 0;
        monthlyDataObj[month].orders += 1;
      });

      const monthlyData = Object.entries(monthlyDataObj)
        .map(([month, data]) => ({ month, ...data }))
        .slice(-6);

      const totalCustomers = new Set(tenantOrders.map(o => o.customerInfo?.email)).size;
      const pendingOrders = tenantOrders.filter(o => o.status === 'pending').length;
      const completedOrders = tenantOrders.filter(o => o.status === 'delivered').length;
      const averageItemsPerOrder = totalOrders
        ? tenantOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0) / totalOrders
        : 0;

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        averageOrderValue,
        recentOrders,
        topProducts,
        monthlyData,
        totalCustomers,
        pendingOrders,
        completedOrders,
        averageItemsPerOrder,
        loading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });

    } catch (err) {
      setAnalytics(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, [navigate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refreshAnalytics = () => {
    setAnalytics(prev => ({ ...prev, loading: true }));
    loadAnalytics();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (analytics.loading) return <div style={{ padding: 20, textAlign: 'center' }}><h2>Loading analytics...</h2></div>;

  if (analytics.error) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>Error Loading Analytics</h2>
      <p style={{ color: "#dc3545" }}>{analytics.error}</p>
      <button onClick={refreshAnalytics} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}>Try Again</button>
    </div>
  );

  if (!analytics.totalOrders && !analytics.totalProducts) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>No Data Available</h2>
      <p>No orders or products found. Start by adding products and making sales.</p>
      <button onClick={() => navigate("/add-product")} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 4 }}>Add Your First Product</button>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30, alignItems: "center" }}>
        <div>
          <h2>Store Analytics</h2>
          <p style={{ color: "#666" }}>Track your store performance and sales</p>
          {analytics.lastUpdated && <p style={{ fontSize: 12, color: "#999" }}>Last updated: {formatDate(analytics.lastUpdated)}</p>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/tenant")} style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}>Back to Dashboard</button>
          <button onClick={refreshAnalytics} disabled={analytics.loading} style={{ padding: "8px 16px", backgroundColor: analytics.loading ? "#6c757d" : "#28a745", color: "white", border: "none", borderRadius: 4 }}>{analytics.loading ? "Refreshing..." : "Refresh Data"}</button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 30 }}>
        {[
          { label: "Total Revenue", value: formatCurrency(analytics.totalRevenue), subtitle: `From ${analytics.totalCustomers} customers`, color: "#28a745" },
          { label: "Total Orders", value: analytics.totalOrders, subtitle: `${analytics.completedOrders} completed`, color: "#007bff" },
          { label: "Products", value: analytics.totalProducts, subtitle: `${analytics.pendingOrders} pending`, color: "#17a2b8" },
          { label: "Avg Order Value", value: formatCurrency(analytics.averageOrderValue), subtitle: `${analytics.averageItemsPerOrder.toFixed(1)} items/order`, color: "#6f42c1" }
        ].map((metric, i) => (
          <div key={i} style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5em", fontWeight: "bold", color: metric.color, marginBottom: 10 }}>{metric.value}</div>
            <div style={{ color: "#666", fontSize: "1.1em" }}>{metric.label}</div>
            <div style={{ fontSize: "0.9em", color: "#999", marginTop: 5 }}>{metric.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue & Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {/* Monthly Revenue Chart */}
        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: 20, color: "#333" }}>Monthly Revenue</h3>
          <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 10 }}>
            {analytics.monthlyData.map(data => {
              const maxRevenue = Math.max(...analytics.monthlyData.map(d => d.revenue)) || 1;
              return (
                <div key={data.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "100%", height: `${Math.max((data.revenue / maxRevenue) * 180, 10)}px`, backgroundColor: "#007bff", borderRadius: "4px 4px 0 0", position: "relative" }}>
                    <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: "bold" }}>{formatCurrency(data.revenue)}</div>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 5, color: "#666" }}>{data.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: 20, color: "#333" }}>Recent Orders</h3>
          {analytics.recentOrders.length === 0 ? <p style={{ color: "#666", textAlign: "center", padding: 20 }}>No orders yet</p> :
            analytics.recentOrders.map(order => (
              <div key={order.orderId || order.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#333" }}>Order #{order.orderId || order.id || 'N/A'}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{formatDate(order.createdAt)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "bold", color: "#28a745" }}>{formatCurrency(order.totalAmount || 0)}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{order.status || 'pending'}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginTop: 30 }}>
        <h3 style={{ marginBottom: 20, color: "#333" }}>Top Products</h3>
        {analytics.topProducts.length === 0 ? <p style={{ color: "#666", textAlign: "center", padding: 20 }}>No products available</p> :
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee" }}>
                <th style={{ padding: 12, textAlign: "left", color: "#333" }}>Product</th>
                <th style={{ padding: 12, textAlign: "center", color: "#333" }}>Sales</th>
                <th style={{ padding: 12, textAlign: "right", color: "#333" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map(product => (
                <tr key={product.productId} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: "bold", color: "#333" }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>₹{product.price} • Stock: {product.stock}</div>
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>{product.sales}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: "bold", color: "#28a745" }}>{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

export default ViewAnalytics;