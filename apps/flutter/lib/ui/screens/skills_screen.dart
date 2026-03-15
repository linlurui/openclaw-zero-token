import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import '../widgets/adaptive_scaffold.dart';
import '../../core/models/skill_models.dart';
import '../../services/skills/skill_service.dart';

/// Skills discovery screen (v2)
class SkillsScreen extends ConsumerStatefulWidget {
  const SkillsScreen({super.key});

  @override
  ConsumerState<SkillsScreen> createState() => _SkillsScreenState();
}

class _SkillsScreenState extends ConsumerState<SkillsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _suggestController = TextEditingController();
  String _searchQuery = '';
  bool _showSuggestPanel = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _suggestController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final skillsAsync = ref.watch(skillsListProvider);

    return AdaptiveScaffold(
      title: 'Skills',
      actions: [
        IconButton(
          icon: const Icon(Icons.lightbulb_outline),
          onPressed: () {
            setState(() => _showSuggestPanel = !_showSuggestPanel);
          },
          tooltip: 'Suggest skills',
        ),
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () => ref.invalidate(skillsListProvider),
          tooltip: 'Refresh',
        ),
      ],
      body: Column(
        children: [
          // Suggestion panel
          if (_showSuggestPanel) _buildSuggestPanel(theme, colorScheme),

          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search skills...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value);
              },
            ),
          ),

          // Category tabs
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Bundled'),
              Tab(text: 'Installed'),
              Tab(text: 'Community'),
            ],
            labelColor: colorScheme.primary,
            indicatorColor: colorScheme.primary,
          ),

          // Skills list
          Expanded(
            child: skillsAsync.when(
              data: (skills) => _buildSkillsList(skills),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 48, color: colorScheme.error),
                    const SizedBox(height: 16),
                    Text('Failed to load skills: $error'),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => ref.invalidate(skillsListProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestPanel(ThemeData theme, ColorScheme colorScheme) {
    final suggestionsAsync = _suggestController.text.isNotEmpty
        ? ref.watch(skillSuggestionsProvider(_suggestController.text))
        : null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer.withOpacity(0.3),
        border: Border(bottom: BorderSide(color: colorScheme.outlineVariant)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb, color: colorScheme.primary),
              const SizedBox(width: 8),
              Text(
                'What do you want to do?',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _suggestController,
            decoration: InputDecoration(
              hintText: 'e.g., "I need to post tweets" or "generate images"',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: colorScheme.surface,
            ),
            onChanged: (value) {
              if (value.isNotEmpty) {
                ref.invalidate(skillSuggestionsProvider(value));
              }
              setState(() {});
            },
          ),
          if (suggestionsAsync != null) ...[
            const SizedBox(height: 12),
            suggestionsAsync.when(
              data: (suggestions) {
                if (suggestions.isEmpty) {
                  return Text(
                    'No matching skills found. Try different keywords.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  );
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Suggested skills:',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: suggestions.map((s) {
                        return ActionChip(
                          avatar: Text(s.skill.metadata?.emoji ?? '📦'),
                          label: Text(s.skill.name),
                          onPressed: () => _showSkillDetails(s.skill),
                        );
                      }).toList(),
                    ),
                  ],
                );
              },
              loading: () => const SizedBox(
                height: 40,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, s) => Text('Error: $e'),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 200.ms).slideY(begin: -0.1, end: 0);
  }

  Widget _buildSkillsList(SkillsListResponse skills) {
    return TabBarView(
      controller: _tabController,
      children: [
        _buildSkillGrid(skills.bundled, SkillCategory.bundled),
        _buildSkillGrid(skills.installed, SkillCategory.installed),
        _buildSkillGrid(skills.community, SkillCategory.community),
      ],
    );
  }

  Widget _buildSkillGrid(List<Skill> skills, SkillCategory category) {
    final filtered = _searchQuery.isEmpty
        ? skills
        : skills.where((s) {
            final q = _searchQuery.toLowerCase();
            return s.name.toLowerCase().contains(q) ||
                s.description.toLowerCase().contains(q);
          }).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _searchQuery.isEmpty ? Icons.inbox : Icons.search_off,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isEmpty
                  ? 'No skills in this category'
                  : 'No skills match "$_searchQuery"',
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 300,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.2,
      ),
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final skill = filtered[index];
        return _SkillCard(
          skill: skill,
          onTap: () => _showSkillDetails(skill),
        ).animate().fadeIn(duration: 200.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }

  void _showSkillDetails(Skill skill) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => _SkillDetailSheet(skill: skill),
    );
  }
}

/// Skill card widget
class _SkillCard extends StatelessWidget {
  final Skill skill;
  final VoidCallback onTap;

  const _SkillCard({required this.skill, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      skill.metadata?.emoji ?? '📦',
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          skill.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        _CategoryChip(category: skill.category),
                      ],
                    ),
                  ),
                  if (skill.isInstalled)
                    Icon(Icons.check_circle, color: Colors.green, size: 20),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                skill.description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const Spacer(),
              if (skill.metadata?.requires != null || !skill.isInstalled)
                Row(
                  children: [
                    Icon(
                      skill.meetsRequirements
                          ? Icons.check_circle_outline
                          : Icons.warning_amber,
                      size: 14,
                      color: skill.meetsRequirements ? Colors.green : Colors.orange,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      skill.isInstalled
                          ? (skill.meetsRequirements ? 'Ready' : 'Needs setup')
                          : 'Not installed',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: skill.meetsRequirements ? Colors.green : Colors.orange,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Category chip widget
class _CategoryChip extends StatelessWidget {
  final SkillCategory category;

  const _CategoryChip({required this.category});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (category) {
      SkillCategory.bundled => ('Bundled', Colors.blue),
      SkillCategory.installed => ('Installed', Colors.green),
      SkillCategory.community => ('Community', Colors.purple),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w500),
      ),
    );
  }
}

/// Skill detail bottom sheet
class _SkillDetailSheet extends ConsumerWidget {
  final Skill skill;

  const _SkillDetailSheet({required this.skill});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        skill.metadata?.emoji ?? '📦',
                        style: const TextStyle(fontSize: 32),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            skill.name,
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              _CategoryChip(category: skill.category),
                              const SizedBox(width: 8),
                              if (skill.version.isNotEmpty)
                                Text(
                                  'v${skill.version}',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(height: 32),

              // Content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    // Description
                    Text(
                      'Description',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      skill.description,
                      style: theme.textTheme.bodyMedium,
                    ),

                    const SizedBox(height: 24),

                    // Status
                    Text(
                      'Status',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildStatusTile(
                      icon: skill.isInstalled ? Icons.check_circle : Icons.circle_outlined,
                      label: 'Installed',
                      value: skill.isInstalled ? 'Yes' : 'No',
                      color: skill.isInstalled ? Colors.green : Colors.grey,
                    ),
                    if (skill.metadata?.requires != null)
                      _buildStatusTile(
                        icon: skill.meetsRequirements
                            ? Icons.check_circle
                            : Icons.warning_amber,
                        label: 'Requirements',
                        value: skill.meetsRequirements ? 'Met' : 'Missing dependencies',
                        color: skill.meetsRequirements ? Colors.green : Colors.orange,
                      ),

                    if (skill.metadata?.requires?.bins != null) ...[
                      const SizedBox(height: 24),
                      Text(
                        'Required Tools',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...skill.metadata!.requires!.bins!.map(
                        (bin) => ListTile(
                          leading: const Icon(Icons.terminal),
                          title: Text(bin),
                          dense: true,
                        ),
                      ),
                    ],

                    if (skill.installCommand != null) ...[
                      const SizedBox(height: 24),
                      Text(
                        'Install Command',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                skill.installCommand!,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy),
                              onPressed: () {
                                // TODO: Copy to clipboard
                              },
                              tooltip: 'Copy',
                            ),
                          ],
                        ),
                      ),
                    ],

                    if (skill.metadata?.homepage != null) ...[
                      const SizedBox(height: 24),
                      Text(
                        'Links',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ListTile(
                        leading: const Icon(Icons.link),
                        title: Text(skill.metadata!.homepage!),
                        trailing: const Icon(Icons.open_in_new),
                        onTap: () {
                          // TODO: Open URL
                        },
                      ),
                    ],

                    const SizedBox(height: 32),

                    // Actions
                    if (!skill.isInstalled)
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: () async {
                            final service = ref.read(skillServiceProvider);
                            await service.installSkill(skill.name);
                          },
                          icon: const Icon(Icons.download),
                          label: const Text('Install Skill'),
                        ),
                      ),

                    if (skill.isInstalled && !skill.meetsRequirements)
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: () {
                            // TODO: Install dependencies
                          },
                          icon: const Icon(Icons.build),
                          label: const Text('Install Dependencies'),
                        ),
                      ),

                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusTile({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(label),
      trailing: Text(
        value,
        style: TextStyle(color: color, fontWeight: FontWeight.w500),
      ),
      dense: true,
    );
  }
}