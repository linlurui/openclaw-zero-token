import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import 'package:openclaw_client/core/models/gateway_models.dart';
import 'package:openclaw_client/services/gateway/gateway_service.dart';
import 'package:openclaw_client/ui/widgets/gateway_card.dart';
import 'package:openclaw_client/ui/widgets/connection_status_widget.dart';

/// Gateway 发现屏幕
class DiscoveryScreen extends ConsumerStatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  ConsumerState<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends ConsumerState<DiscoveryScreen> {
  final _hostController = TextEditingController();
  final _portController = TextEditingController(text: '3001');
  bool _isScanning = false;

  @override
  void initState() {
    super.initState();
    _startDiscovery();
  }

  Future<void> _startDiscovery() async {
    setState(() => _isScanning = true);
    await ref.read(discoveredGatewaysProvider.notifier).startDiscovery();
    setState(() => _isScanning = false);
  }

  Future<void> _connectToGateway(DiscoveredGateway gateway) async {
    final config = GatewayConfig(
      host: gateway.lanHost ?? gateway.serviceHost ?? '127.0.0.1',
      port: gateway.gatewayPort,
      useTLS: false,
    );

    await ref.read(gatewayConnectionProvider.notifier).connect(config);
  }

  Future<void> _connectManual() async {
    final host = _hostController.text.trim();
    final port = int.tryParse(_portController.text) ?? 3001;

    if (host.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请输入 Gateway 地址')),
      );
      return;
    }

    final config = GatewayConfig(
      host: host,
      port: port,
      useTLS: false,
    );

    await ref.read(gatewayConnectionProvider.notifier).connect(config);
  }

  @override
  Widget build(BuildContext context) {
    final gateways = ref.watch(discoveredGatewaysProvider);
    final connectionState = ref.watch(gatewayConnectionProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 标题区域
              _buildHeader(context),
              const SizedBox(height: 24),

              // 连接状态
              const ConnectionStatusWidget(showDetails: true),
              const SizedBox(height: 24),

              // 手动连接
              _buildManualConnect(context),
              const SizedBox(height: 24),

              // 发现的 Gateway
              _buildDiscoveredGateways(context, gateways, connectionState),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '发现 Gateway',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          '连接到局域网或远程 Gateway 以开始使用',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideY(begin: -0.1);
  }

  Widget _buildManualConnect(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '手动连接',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: _hostController,
                    decoration: const InputDecoration(
                      labelText: 'Gateway 地址',
                      hintText: '192.168.1.100 或 gateway.example.com',
                      prefixIcon: Icon(Icons.dns_outlined),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _portController,
                    decoration: const InputDecoration(
                      labelText: '端口',
                      prefixIcon: Icon(Icons.settings_ethernet),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _connectManual,
                icon: const Icon(Icons.link),
                label: const Text('连接'),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 100.ms).slideX(begin: -0.1);
  }

  Widget _buildDiscoveredGateways(
    BuildContext context,
    List<DiscoveredGateway> gateways,
    GatewayConnectionState connectionState,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              '发现的 Gateway',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const Spacer(),
            if (_isScanning)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              TextButton.icon(
                onPressed: _startDiscovery,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('刷新'),
              ),
          ],
        ),
        const SizedBox(height: 12),
        if (gateways.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.search_off,
                      size: 48,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '未发现 Gateway',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '确保 Gateway 正在运行并处于同一网络',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ...gateways.map((gateway) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GatewayCard(
                  gateway: gateway,
                  isConnected: connectionState == GatewayConnectionState.connected,
                  onConnect: () => _connectToGateway(gateway),
                ),
              )),
      ],
    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1);
  }

  @override
  void dispose() {
    _hostController.dispose();
    _portController.dispose();
    super.dispose();
  }
}
