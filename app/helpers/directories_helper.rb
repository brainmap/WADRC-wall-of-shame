module DirectoriesHelper
	def tab_to(days, label)
		content_tag(:li, link_to(label, directories_path(:days => days)),
			:class => (@days == days) ? :active : :inactive
		)
	end
end
