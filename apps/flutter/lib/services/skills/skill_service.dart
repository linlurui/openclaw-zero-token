import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/skill_models.dart';

part 'skill_service.g.dart';

/// Skill service provider
@riverpod
SkillService skillService(Ref ref) {
  return SkillService(ref);
}

/// Skill discovery and management service (v2)
class SkillService {
  final Ref _ref;

  SkillService(this._ref);

  /// List all available skills
  Future<SkillsListResponse> listSkills({String? category}) async {
    // TODO: Implement actual IPC call to Gateway
    final all = SkillsListResponse(
      bundled: _getBundledSkills(),
      installed: _getInstalledSkills(),
      community: _getCommunitySkills(),
    );

    if (category != null) {
      return SkillsListResponse(
        bundled: category == 'bundled' ? all.bundled : [],
        installed: category == 'installed' ? all.installed : [],
        community: category == 'community' ? all.community : [],
      );
    }

    return all;
  }

  /// Search skills by query
  Future<SkillSearchResult> searchSkills(String query) async {
    final allSkills = await listSkills();
    final all = [
      ...allSkills.bundled,
      ...allSkills.installed,
      ...allSkills.community,
    ];

    final lowerQuery = query.toLowerCase();
    final matches = all.where((skill) {
      return skill.name.toLowerCase().contains(lowerQuery) ||
          skill.description.toLowerCase().contains(lowerQuery);
    }).toList();

    return SkillSearchResult(
      skills: matches,
      query: query,
      total: matches.length,
    );
  }

  /// Get skill details by name
  Future<Skill?> getSkillInfo(String name) async {
    final allSkills = await listSkills();
    final all = [
      ...allSkills.bundled,
      ...allSkills.installed,
      ...allSkills.community,
    ];

    return all.cast<Skill?>().firstWhere(
          (s) => s?.name == name,
          orElse: () => null,
        );
  }

  /// Suggest skills based on task description (AI-powered)
  Future<List<SkillSuggestion>> suggestSkills(String taskDescription) async {
    final allSkills = await listSkills();
    final all = [
      ...allSkills.bundled,
      ...allSkills.installed,
      ...allSkills.community,
    ];

    final suggestions = <SkillSuggestion>[];
    final lowerTask = taskDescription.toLowerCase();

    // Simple keyword matching for suggestions
    final keywordMap = {
      'twitter': ['xurl', 'twitter', 'tweet'],
      'x.com': ['xurl', 'twitter'],
      'tweet': ['xurl'],
      'image': ['openai-image-gen', 'stable-diffusion', 'dall-e'],
      'generate image': ['openai-image-gen'],
      'dall-e': ['openai-image-gen'],
      'discord': ['discord'],
      'slack': ['slack'],
      'telegram': ['telegram'],
      'web scrap': ['browser', 'web_fetch'],
      'browse': ['browser'],
      'file': ['read', 'write', 'edit'],
      'search': ['glob', 'grep', 'web_search'],
      'github': ['github'],
      'database': ['database', 'sql'],
      'notion': ['notion'],
      'email': ['email', 'sendgrid'],
      'sms': ['sms', 'twilio'],
      'voice': ['speech', 'voice'],
      'camera': ['camera'],
      'location': ['location', 'geolocator'],
    };

    for (final skill in all) {
      double confidence = 0;
      String reason = '';

      for (final entry in keywordMap.entries) {
        if (lowerTask.contains(entry.key)) {
          for (final keyword in entry.value) {
            if (skill.name.toLowerCase().contains(keyword) ||
                skill.description.toLowerCase().contains(keyword)) {
              confidence = 0.8;
              reason = 'Matches "${entry.key}" in your request';
              break;
            }
          }
        }
        if (confidence > 0) break;
      }

      // Check skill name/description direct match
      if (confidence == 0) {
        final skillKeywords = skill.name.toLowerCase().split('_');
        for (final kw in skillKeywords) {
          if (lowerTask.contains(kw)) {
            confidence = 0.5;
            reason = 'Related to "$kw"';
            break;
          }
        }
      }

      if (confidence > 0) {
        suggestions.add(SkillSuggestion(
          skill: skill,
          relevanceReason: reason,
          confidence: confidence,
        ));
      }
    }

    suggestions.sort((a, b) => b.confidence.compareTo(a.confidence));
    return suggestions.take(5).toList();
  }

  /// Check if system meets skill requirements
  Future<bool> checkRequirements(String skillName) async {
    // TODO: Implement actual requirement check via IPC
    final skill = await getSkillInfo(skillName);
    if (skill == null) return false;
    return skill.meetsRequirements;
  }

  /// Install a skill from ClawHub
  Future<SkillInstallResult> installSkill(String skillName) async {
    // TODO: Implement skill installation via IPC
    // This would call the gateway to install the skill
    return SkillInstallResult(
      success: false,
      message: 'Installation not yet implemented. Please install manually.',
    );
  }

  // Built-in bundled skills
  List<Skill> _getBundledSkills() {
    return const [
      Skill(
        name: 'find-skills-v2',
        description: 'Smart skill discovery and installation. Helps you find and install skills for any task.',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        version: '1.0.0',
        metadata: SkillMetadata(
          emoji: '🔍',
          always: true,
          homepage: 'https://clawhub.ai/eathon/find-skills-v2',
        ),
      ),
      Skill(
        name: 'browser',
        description: 'Web browser automation and control',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🌐'),
      ),
      Skill(
        name: 'shell',
        description: 'Execute shell commands',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '💻'),
      ),
      Skill(
        name: 'read',
        description: 'Read file contents',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '📖'),
      ),
      Skill(
        name: 'write',
        description: 'Write content to files',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '✏️'),
      ),
      Skill(
        name: 'edit',
        description: 'Edit files with precision',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '📝'),
      ),
      Skill(
        name: 'glob',
        description: 'Find files by pattern',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🗂️'),
      ),
      Skill(
        name: 'grep',
        description: 'Search file contents',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🔎'),
      ),
      Skill(
        name: 'web_search',
        description: 'Search the web for information',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🔍'),
      ),
      Skill(
        name: 'web_fetch',
        description: 'Fetch and parse web content',
        category: SkillCategory.bundled,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🌐'),
      ),
    ];
  }

  // User-installed skills
  List<Skill> _getInstalledSkills() {
    return const [
      Skill(
        name: 'xurl',
        description: 'Twitter/X API integration for posting, searching, and more',
        category: SkillCategory.installed,
        isInstalled: true,
        meetsRequirements: true,
        version: '1.0.0',
        installCommand: 'brew install xdevplatform/tap/xurl',
        metadata: SkillMetadata(
          emoji: '🐦',
          homepage: 'https://github.com/xdevplatform/xurl',
          requires: SkillRequirement(bins: ['xurl']),
        ),
      ),
      Skill(
        name: 'openai-image-gen',
        description: 'DALL-E image generation',
        category: SkillCategory.installed,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🎨'),
      ),
      Skill(
        name: 'skill-creator',
        description: 'Create new OpenClaw skills',
        category: SkillCategory.installed,
        isInstalled: true,
        meetsRequirements: true,
        metadata: SkillMetadata(emoji: '🛠️'),
      ),
    ];
  }

  // Community skills (available but not installed)
  List<Skill> _getCommunitySkills() {
    return const [
      Skill(
        name: 'discord',
        description: 'Discord bot integration',
        category: SkillCategory.community,
        isInstalled: false,
        meetsRequirements: false,
        metadata: SkillMetadata(
          emoji: '💬',
          homepage: 'https://clawhub.ai/skills/discord',
        ),
      ),
      Skill(
        name: 'slack',
        description: 'Slack workspace integration',
        category: SkillCategory.community,
        isInstalled: false,
        meetsRequirements: false,
        metadata: SkillMetadata(
          emoji: '💼',
          homepage: 'https://clawhub.ai/skills/slack',
        ),
      ),
      Skill(
        name: 'telegram',
        description: 'Telegram bot integration',
        category: SkillCategory.community,
        isInstalled: false,
        meetsRequirements: false,
        metadata: SkillMetadata(
          emoji: '📱',
          homepage: 'https://clawhub.ai/skills/telegram',
        ),
      ),
      Skill(
        name: 'github',
        description: 'GitHub operations and automation',
        category: SkillCategory.community,
        isInstalled: false,
        meetsRequirements: false,
        metadata: SkillMetadata(
          emoji: '🐙',
          homepage: 'https://clawhub.ai/skills/github',
        ),
      ),
      Skill(
        name: 'notion',
        description: 'Notion workspace integration',
        category: SkillCategory.community,
        isInstalled: false,
        meetsRequirements: false,
        metadata: SkillMetadata(
          emoji: '📓',
          homepage: 'https://clawhub.ai/skills/notion',
        ),
      ),
      Skill(
        name: 'stable-diffusion',
        description: 'Local Stable Diffusion image generation',
        category: SkillCategory.community,
        isInstalled: false,
        meetsRequirements: false,
        metadata: SkillMetadata(
          emoji: '🖼️',
          homepage: 'https://clawhub.ai/skills/stable-diffusion',
        ),
      ),
    ];
  }
}

/// Skill installation result
class SkillInstallResult {
  final bool success;
  final String message;
  final String? installCommand;

  const SkillInstallResult({
    required this.success,
    required this.message,
    this.installCommand,
  });
}

/// Skills list provider
@riverpod
Future<SkillsListResponse> skillsList(Ref ref) async {
  final service = ref.watch(skillServiceProvider);
  return service.listSkills();
}

/// Skill search provider
@riverpod
Future<SkillSearchResult> skillSearch(Ref ref, String query) async {
  final service = ref.watch(skillServiceProvider);
  return service.searchSkills(query);
}

/// Skill suggestions provider
@riverpod
Future<List<SkillSuggestion>> skillSuggestions(Ref ref, String task) async {
  final service = ref.watch(skillServiceProvider);
  return service.suggestSkills(task);
}

/// Selected skill provider
@riverpod
class SelectedSkill extends _$SelectedSkill {
  @override
  Skill? build() => null;

  void select(Skill? skill) {
    state = skill;
  }
}